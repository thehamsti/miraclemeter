import WidgetKit
import SwiftUI

// MARK: - Color Extensions (matching app theme)
extension Color {
    // Primary colors
    static let mmPrimary = Color(red: 0.39, green: 0.22, blue: 0.45) // #643872
    static let mmPrimaryLight = Color(red: 0.61, green: 0.49, blue: 0.74) // #9B7EBD
    static let mmSuccess = Color(red: 0.06, green: 0.73, blue: 0.51) // #10B981
    
    // Gender colors
    static let mmBoyBlue = Color(red: 0.15, green: 0.39, blue: 0.92) // #2563EB
    static let mmGirlPink = Color(red: 0.86, green: 0.15, blue: 0.47) // #DB2777
    static let mmAngelGold = Color(red: 0.96, green: 0.62, blue: 0.04) // #F59E0B
    
    // Background colors
    static let mmDarkBg = Color(red: 0.06, green: 0.09, blue: 0.16) // #0F172A
    static let mmDarkCard = Color(red: 0.12, green: 0.16, blue: 0.24) // #1E293B
}

// MARK: - Deep Link URLs for Widget Actions
// Using deep links instead of AppIntents avoids LNActionExecutorErrorDomain error 2018

struct WidgetDeepLinks {
    static let baseURL = "miraclemeter://"
    
    static func quickAdd(gender: String) -> URL {
        // Save to shared container before opening app
        savePendingRecord(gender: gender)
        return URL(string: "\(baseURL)quick-add?gender=\(gender)")!
    }
    
    static let openApp = URL(string: baseURL)!
    
    private static func savePendingRecord(gender: String) {
        let suiteName = "group.com.hamstico.miraclemeter"
        let pendingRecordKey = "pendingBirthRecord"
        
        if let defaults = UserDefaults(suiteName: suiteName) {
            let record: [String: Any] = [
                "id": String(Int(Date().timeIntervalSince1970 * 1000)),
                "gender": gender,
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ]
            if let encoded = try? JSONSerialization.data(withJSONObject: record) {
                defaults.set(encoded, forKey: pendingRecordKey)
            }
        }
    }
}

// MARK: - Timeline Provider

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetEntry {
        WidgetEntry(date: Date(), todayCount: 0, totalCount: 0)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (WidgetEntry) -> Void) {
        let data = SharedDataManager.shared.getWidgetData()
        let entry = WidgetEntry(
            date: Date(),
            todayCount: data.todayCount,
            totalCount: data.totalCount
        )
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<WidgetEntry>) -> Void) {
        let data = SharedDataManager.shared.getWidgetData()
        let entry = WidgetEntry(
            date: Date(),
            todayCount: data.todayCount,
            totalCount: data.totalCount
        )
        
        // Refresh every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: - Timeline Entry

struct WidgetEntry: TimelineEntry {
    let date: Date
    let todayCount: Int
    let totalCount: Int
}

// MARK: - Widget Views

struct SmallWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.colorScheme) var colorScheme
    
    var primaryColor: Color {
        colorScheme == .dark ? Color.mmPrimaryLight : Color.mmPrimary
    }
    
    var backgroundColor: Color {
        colorScheme == .dark ? Color.mmDarkBg : Color.white
    }
    
    var body: some View {
        VStack(spacing: 8) {
            // Header
            HStack(spacing: 4) {
                Image(systemName: "heart.fill")
                    .font(.caption)
                    .foregroundColor(primaryColor)
                Text("Today: \(entry.todayCount)")
                    .font(.caption.bold())
                    .foregroundColor(primaryColor)
            }
            
            Spacer()
            
            // Quick add buttons using deep links
            HStack(spacing: 12) {
                Link(destination: WidgetDeepLinks.quickAdd(gender: "boy")) {
                    VStack(spacing: 2) {
                        Image(systemName: "face.smiling.inverse")
                            .font(.title2)
                        Text("Boy")
                            .font(.caption2)
                    }
                    .foregroundColor(Color.mmBoyBlue)
                    .frame(maxWidth: .infinity)
                }
                
                Link(destination: WidgetDeepLinks.quickAdd(gender: "girl")) {
                    VStack(spacing: 2) {
                        Image(systemName: "face.smiling.inverse")
                            .font(.title2)
                        Text("Girl")
                            .font(.caption2)
                    }
                    .foregroundColor(Color.mmGirlPink)
                    .frame(maxWidth: .infinity)
                }
            }
            
            Spacer()
            
            // Total count
            Text("Total: \(entry.totalCount)")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding(12)
        .containerBackground(for: .widget) {
            backgroundColor
        }
    }
}

struct MediumWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.colorScheme) var colorScheme
    
    var primaryColor: Color {
        colorScheme == .dark ? Color.mmPrimaryLight : Color.mmPrimary
    }
    
    var cardBackground: Color {
        colorScheme == .dark ? Color.mmDarkCard : Color(red: 0.95, green: 0.95, blue: 0.97) // systemGray6 equivalent
    }
    
    var body: some View {
        HStack(spacing: 16) {
            // Stats section
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 4) {
                    Image(systemName: "heart.fill")
                        .foregroundColor(primaryColor)
                    Text("Miracle Meter")
                        .font(.headline)
                        .foregroundColor(primaryColor)
                }
                
                Spacer()
                
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("Today")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(entry.todayCount)")
                            .font(.title2.bold())
                            .foregroundColor(primaryColor)
                    }
                    
                    HStack {
                        Text("Total")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(entry.totalCount)")
                            .font(.callout.bold())
                            .foregroundColor(.secondary)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            // Quick add buttons using deep links
            VStack(spacing: 8) {
                Link(destination: WidgetDeepLinks.quickAdd(gender: "boy")) {
                    HStack {
                        Image(systemName: "face.smiling.inverse")
                        Text("Boy")
                    }
                    .font(.subheadline.bold())
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.mmBoyBlue)
                    .cornerRadius(10)
                }
                
                Link(destination: WidgetDeepLinks.quickAdd(gender: "girl")) {
                    HStack {
                        Image(systemName: "face.smiling.inverse")
                        Text("Girl")
                    }
                    .font(.subheadline.bold())
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.mmGirlPink)
                    .cornerRadius(10)
                }
                
                Link(destination: WidgetDeepLinks.quickAdd(gender: "angel")) {
                    HStack {
                        Image(systemName: "star.fill")
                        Text("Angel")
                    }
                    .font(.caption.bold())
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                    .background(Color.mmAngelGold)
                    .cornerRadius(8)
                }
            }
            .frame(width: 100)
        }
        .padding(16)
        .containerBackground(for: .widget) {
            colorScheme == .dark ? Color.mmDarkBg : Color.white
        }
    }
}

// MARK: - Main Widget

@main
struct MiracleMeterWidget: Widget {
    let kind: String = "MiracleMeterWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            MiracleMeterWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Miracle Meter")
        .description("Quickly add birth records from your home screen")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct MiracleMeterWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: Provider.Entry
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Previews

#Preview(as: .systemSmall) {
    MiracleMeterWidget()
} timeline: {
    WidgetEntry(date: .now, todayCount: 5, totalCount: 127)
}

#Preview(as: .systemMedium) {
    MiracleMeterWidget()
} timeline: {
    WidgetEntry(date: .now, todayCount: 5, totalCount: 127)
}
