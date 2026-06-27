import Foundation
import React

// MARK: - iCloud Documents Sync Native Module

@objc(ICloudSyncBridge)
class ICloudSyncBridge: RCTEventEmitter {

    // MARK: - Constants

    private let onChangeEvent = "onChange"
    private let documentsSubdir = "Documents"
    private let stateFileName = "miraclemeter-state.json"

    // MARK: - State

    // RCTEventEmitter calls startObserving()/stopObserving() on first add / last
    // remove of JS listeners. This RN build does not expose a public hasListeners
    // property, so we track presence ourselves to avoid emitting with no listeners.
    private var hasListeners = false

    private lazy var ioQueue: DispatchQueue = {
        DispatchQueue(label: "com.hamstico.miraclemeter.icloudsync.io")
    }()

    private var cachedContainerURL: URL?

    private lazy var metadataQuery: NSMetadataQuery = {
        let query = NSMetadataQuery()
        query.notificationBatchingInterval = 0.5
        return query
    }()

    // MARK: - Module configuration

    override static func moduleName() -> String! {
        return "ICloudSyncBridge"
    }

    override func supportedEvents() -> [String]! {
        return [onChangeEvent]
    }

    override static func requiresMainQueueSetup() -> Bool {
        return false
    }

    // MARK: - Ubiquity container resolution

    private func resolveContainerURL(completion: @escaping (URL?) -> Void) {
        if let cached = cachedContainerURL {
            completion(cached)
            return
        }
        ioQueue.async { [weak self] in
            guard let self = self else {
                DispatchQueue.main.async { completion(nil) }
                return
            }
            // Resolving the container URL touches the user's iCloud account and
            // must never happen on the main thread.
            let url = FileManager.default.url(forUbiquityContainerIdentifier: nil)
            if let url = url {
                self.cachedContainerURL = url
            }
            DispatchQueue.main.async { completion(url) }
        }
    }

    private func stateFileURL(containerURL: URL) -> URL {
        containerURL.appendingPathComponent(documentsSubdir, isDirectory: true)
            .appendingPathComponent(stateFileName)
    }

    // MARK: - isAvailable

    @objc
    func isAvailable(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolveContainerURL { url in
            resolve(url != nil)
        }
    }

    // MARK: - readAll

    @objc
    func readAll(_ resolve: @escaping RCTPromiseResolveBlock,
                 rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolveContainerURL { [weak self] url in
            guard let self = self, let url = url else {
                resolve(nil)
                return
            }
            self.ioQueue.async {
                let fileURL = self.stateFileURL(containerURL: url)
                guard FileManager.default.fileExists(atPath: fileURL.path) else {
                    DispatchQueue.main.async { resolve(nil) }
                    return
                }
                do {
                    let contents = try String(contentsOf: fileURL, encoding: .utf8)
                    DispatchQueue.main.async { resolve(contents) }
                } catch {
                    print("ICloudSyncBridge: Failed to read iCloud state file: \(error.localizedDescription)")
                    DispatchQueue.main.async { resolve(nil) }
                }
            }
        }
    }

    // MARK: - writeAll

    @objc
    func writeAll(_ json: String,
                  resolver resolve: @escaping RCTPromiseResolveBlock,
                  rejecter reject: @escaping RCTPromiseRejectBlock) {
        resolveContainerURL { [weak self] url in
            guard let self = self, let url = url else {
                reject("icloud_unavailable", "iCloud ubiquity container is not available", nil)
                return
            }
            self.ioQueue.async {
                let docsURL = url.appendingPathComponent(self.documentsSubdir, isDirectory: true)
                let fileURL = self.stateFileURL(containerURL: url)
                do {
                    try FileManager.default.createDirectory(at: docsURL, withIntermediateDirectories: true)
                    try json.write(to: fileURL, atomically: true, encoding: .utf8)
                    print("ICloudSyncBridge: Wrote state blob (\(json.count) bytes) to iCloud")
                    DispatchQueue.main.async { resolve(true) }
                } catch {
                    print("ICloudSyncBridge: Failed to write iCloud state file: \(error.localizedDescription)")
                    DispatchQueue.main.async {
                        reject("write_failed", error.localizedDescription, error)
                    }
                }
            }
        }
    }

    // MARK: - Live change notifications

    override func startObserving() {
        hasListeners = true
        resolveContainerURL { [weak self] url in
            guard let self = self, let url = url else {
                print("ICloudSyncBridge: Cannot observe changes — iCloud container unavailable")
                return
            }
            self.startMetadataQuery(containerURL: url)
        }
    }

    override func stopObserving() {
        hasListeners = false
        if metadataQuery.isStarted {
            metadataQuery.stop()
        }
        NotificationCenter.default.removeObserver(self, name: .NSMetadataQueryDidUpdate, object: metadataQuery)
        print("ICloudSyncBridge: Stopped observing iCloud changes")
    }

    private func startMetadataQuery(containerURL: URL) {
        metadataQuery.searchScopes = [containerURL]
        metadataQuery.predicate = NSPredicate(format: "%K == %@", NSMetadataItemFSNameKey, stateFileName)

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleMetadataUpdate),
            name: .NSMetadataQueryDidUpdate,
            object: metadataQuery
        )

        if metadataQuery.start() {
            print("ICloudSyncBridge: Started observing iCloud changes for \(stateFileName)")
        } else {
            print("ICloudSyncBridge: Failed to start NSMetadataQuery")
        }
    }

    @objc
    private func handleMetadataUpdate(_ notification: Notification) {
        guard hasListeners else { return }
        sendEvent(withName: onChangeEvent, body: nil)
    }
}
