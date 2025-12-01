import Foundation

// MARK: - Shared Data Types

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
    
    init(gender: String) {
        self.id = String(Int(Date().timeIntervalSince1970 * 1000))
        self.gender = gender
        self.timestamp = Date()
    }
}

// MARK: - Shared Data Manager

class SharedDataManager {
    static let shared = SharedDataManager()
    
    private let suiteName = "group.com.hamstico.miraclemeter"
    private let widgetDataKey = "widgetData"
    private let pendingRecordKey = "pendingBirthRecord"
    
    private var userDefaults: UserDefaults? {
        UserDefaults(suiteName: suiteName)
    }
    
    private init() {}
    
    // MARK: - Widget Data
    
    func getWidgetData() -> WidgetData {
        guard let defaults = userDefaults,
              let data = defaults.data(forKey: widgetDataKey),
              let widgetData = try? JSONDecoder().decode(WidgetData.self, from: data) else {
            return WidgetData()
        }
        
        // Check if last update was today, if not reset today count
        let calendar = Calendar.current
        if !calendar.isDateInToday(widgetData.lastUpdated) {
            return WidgetData(todayCount: 0, totalCount: widgetData.totalCount, lastUpdated: Date())
        }
        
        return widgetData
    }
    
    func saveWidgetData(_ data: WidgetData) {
        guard let defaults = userDefaults,
              let encoded = try? JSONEncoder().encode(data) else {
            return
        }
        defaults.set(encoded, forKey: widgetDataKey)
    }
    
    func updateCounts(todayCount: Int, totalCount: Int) {
        let data = WidgetData(todayCount: todayCount, totalCount: totalCount, lastUpdated: Date())
        saveWidgetData(data)
    }
    
    // MARK: - Pending Records (from widget to app)
    
    func savePendingRecord(gender: String) {
        guard let defaults = userDefaults else { return }
        
        let record = PendingBirthRecord(gender: gender)
        if let encoded = try? JSONEncoder().encode(record) {
            defaults.set(encoded, forKey: pendingRecordKey)
        }
    }
    
    func getPendingRecord() -> PendingBirthRecord? {
        guard let defaults = userDefaults,
              let data = defaults.data(forKey: pendingRecordKey),
              let record = try? JSONDecoder().decode(PendingBirthRecord.self, from: data) else {
            return nil
        }
        return record
    }
    
    func clearPendingRecord() {
        userDefaults?.removeObject(forKey: pendingRecordKey)
    }
}
