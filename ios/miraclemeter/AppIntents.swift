import Foundation
#if canImport(AppIntents)
import AppIntents

// MARK: - Shared App Intents (must be in main app target for widget buttons to work)

@available(iOS 16.0, *)
enum GenderType: String, AppEnum {
    case boy, girl, angel
    
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Gender")
    static var caseDisplayRepresentations: [GenderType: DisplayRepresentation] = [
        .boy: DisplayRepresentation(title: "Boy", image: .init(systemName: "face.smiling")),
        .girl: DisplayRepresentation(title: "Girl", image: .init(systemName: "face.smiling")),
        .angel: DisplayRepresentation(title: "Angel", image: .init(systemName: "star.fill"))
    ]
}

@available(iOS 16.0, *)
struct QuickAddBirthIntent: AppIntent {
    static var title: LocalizedStringResource = "Quick Add Birth"
    static var description = IntentDescription("Add a birth record quickly")
    static var openAppWhenRun: Bool = true
    
    @Parameter(title: "Gender")
    var gender: GenderType
    
    init() {
        self.gender = .boy
    }
    
    init(gender: GenderType) {
        self.gender = gender
    }
    
    func perform() async throws -> some IntentResult {
        // Save pending record to shared container
        let suiteName = "group.com.hamstico.miraclemeter"
        let pendingRecordKey = "pendingBirthRecord"
        
        if let defaults = UserDefaults(suiteName: suiteName) {
            let record: [String: Any] = [
                "id": String(Int(Date().timeIntervalSince1970 * 1000)),
                "gender": gender.rawValue,
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ]
            if let encoded = try? JSONSerialization.data(withJSONObject: record) {
                defaults.set(encoded, forKey: pendingRecordKey)
            }
        }
        
        return .result()
    }
}

@available(iOS 16.0, *)
struct OpenAppIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Miracle Meter"
    static var description = IntentDescription("Open the Miracle Meter app")
    static var openAppWhenRun: Bool = true
    
    func perform() async throws -> some IntentResult {
        return .result()
    }
}

// MARK: - App Shortcuts Provider (registers intents with the system)

@available(iOS 16.0, *)
struct MiracleMeterShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: QuickAddBirthIntent(),
            phrases: [
                "Add birth in \(.applicationName)",
                "Record birth with \(.applicationName)"
            ],
            shortTitle: "Add Birth",
            systemImageName: "heart.fill"
        )
    }
}
#endif
