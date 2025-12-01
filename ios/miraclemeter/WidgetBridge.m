#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetBridge, NSObject)

RCT_EXTERN_METHOD(updateWidgetData:(int)todayCount totalCount:(int)totalCount)

RCT_EXTERN_METHOD(getPendingRecord:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearPendingRecord)

RCT_EXTERN_METHOD(refreshWidget)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
