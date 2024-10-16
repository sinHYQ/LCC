import mitt from 'mitt';

export const emitter = mitt();

export const EmitterEvent = {
    // 打开监控信息
    openMonitorInfo: 'openMonitorInfo',
    // 关闭监控信息
    closeMonitorInfo: 'closeMonitorInfo',
    // 打开设备信息
    openDiveceInfo: 'openDiveceInfo',
    // 关闭设备信息
    closeDiveceInfo: 'closeDiveceInfo',
    // 打开资产信息
    openAssetInfo: 'openAssetInfo',
    // 关闭资产信息
    closeAssetInfo: 'closeAssetInfo',

};