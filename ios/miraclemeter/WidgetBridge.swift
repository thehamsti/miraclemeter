import Foundation
import WidgetKit

// MARK: - Shared Data Types (duplicated from widget for main app access)

struct WidgetData: Codable {
    var todayCount: Int
    var totalCount: Int
    var lastUpdated: Date
    
    init(todayCount: Int = 0, totalCount: Int = 0, lastUpdated: Date = Date()) {
        self.todayCount = todayCount
        self.totalCount = totalCount
        self.lastUpdated = lastUpdated
    }
}

struct PendingBirthRecord: Codable {
    let id: String
    let gender: String
    let timestamp: Date
}

// MARK: - Widget Bridge Native Module

@objc(WidgetBridge)
class WidgetBridge: NSObject {
    
    private let suiteName = "group.com.hamstico.miraclemeter"
    private let widgetDataKey = "widgetData"
    private let pendingRecordKey = "pendingBirthRecord"
    
    private var userDefaults: UserDefaults? {
        UserDefaults(suiteName: suiteName)
    }
    
    // MARK: - Update Widget Data
    
    @objc
    func updateWidgetData(_ todayCount: Int, totalCount: Int) {
        guard let defaults = userDefaults else {
            print("WidgetBridge: Failed to access shared UserDefaults")
            return
        }
        
        let data = WidgetData(todayCount: todayCount, totalCount: totalCount, lastUpdated: Date())
        
        if let encoded = try? JSONEncoder().encode(data) {
            defaults.set(encoded, forKey: widgetDataKey)
            
            // Refresh widget timeline
            WidgetCenter.shared.reloadAllTimelines()
            print("WidgetBridge: Widget data updated - today: \(todayCount), total: \(totalCount)")
        }
    }
    
    // MARK: - Get Pending Record
    
    @objc
    func getPendingRecord(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
        guard let defaults = userDefaults else {
            resolve(nil)
            return
        }
        
        guard let data = defaults.data(forKey: pendingRecordKey),
              let record = try? JSONDecoder().decode(PendingBirthRecord.self, from: data) else {
            resolve(nil)
            return
        }
        
        // Clear the pending record after reading
        defaults.removeObject(forKey: pendingRecordKey)
        
        // Return the record as a dictionary
        let result: [String: Any] = [
            "id": record.id,
            "gender": record.gender,
            "timestamp": record.timestamp.timeIntervalSince1970 * 1000 // Convert to JS timestamp
        ]
        
        resolve(result)
    }
    
    // MARK: - Clear Pending Record
    
    @objc
    func clearPendingRecord() {
        userDefaults?.removeObject(forKey: pendingRecordKey)
    }
    
    // MARK: - Refresh Widget
    
    @objc
    func refreshWidget() {
        WidgetCenter.shared.reloadAllTimelines()
    }
    
    // MARK: - Required for React Native
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
