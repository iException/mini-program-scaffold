import { HTTP, VERSION } from './config'

export default class Tracker {

    static app = getApp()

    static __wxTrack(action, tracktype, data = {}) {
        const uri = '/c/wxmini/' + action
        wx.request({
            url: HTTP.trackerHost + uri,
            method: 'GET',
            data: {
                tracktype: tracktype,
                ...this.__globalData(),
                ...data,
            },
        })
    }

    static __eventLog(et, data = {}) {
        const uri = '/c/ev/' + et
        wx.request({
            url: HTTP.trackerHost + uri,
            method: 'GET',
            data: {
                ...this.__globalData(),
                ...data,
            },
        })
    }

    static __globalData() {
        const pages = getCurrentPages().slice()
        const currentPage = pages[pages.length - 1]

        return {
            // 程序应用属性
            app_type: '[app_type]',
            app_id: '[app_id]',
            app_name: '[app_name]',
            app_role: '[app_role]',
            app_category: '[app_category]',
            template_version: VERSION,
            // debug: 1,
            // preview_version: 1,

            // 访问者标识属性
            track_id: this.app.getTrackId(),
            visitor_id: this.app.getUserToken(),
            ...this.app.getUserSession(),

            // 访问者设备属性
            network_type: this.app.getNetworkType(),
            ...this.app.getSystemInfo(),

            // 时间戳
            timestamp_ms: Date.now(),

            // 访问来源
            ...this.app.getSource()
        }
    }

    /**
     * 需要在 data 中传入 source_params 、source_src_key（如果有的话）
     */
    static pv(params) {
        try {
            this.app = getApp()
            const pageId = params.pageId,
                  pageTitle = params.pageTitle || '',
                  data = params.data || {},
                  pageType = params.pageType ||  'common',
                  pageLevel = params.pageLevel || '';

            if (!pageId) return
            this.__wxTrack('__viewPage', 'pageview', {
                // 用户访问页面属性
                page_type: pageType,
                page_id: pageId,
                page_title: pageTitle,
                page_uuid: this.app.genUUId(),
                ...this.app.getLastPage(),
                page_level: pageLevel,

                ...data,
            })
            this.app.setLastPage(pageId, pageType)
        } catch (err) {
            console.log(err)
        }
    }

    static wxmini(action, data = {}) {
        try {
            this.app = getApp()
            if (!action) return
            this.__wxTrack(action, 'event', {
                ...data,
            })
        } catch (err) {
            console.log(err)
        }
    }
}
