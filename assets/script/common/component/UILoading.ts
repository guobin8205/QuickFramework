import UILoadingDelegate from "../../framework/ui/UILoadingDelegate";
import { Manager } from "../manager/Manager";
import { EventApi } from "../../framework/event/EventApi";
import { ViewZOrder, Config } from "../config/Config";
import { BUNDLE_RESOURCES, ResourceCacheData } from "../../framework/base/Defines";
/**
 * @description 加载动画
 */

export default class UILoading extends UILoadingDelegate {
    private static _instance: UILoading = null;
    public static Instance() { return this._instance || (this._instance = new UILoading()); }
    /**@description 当前loading节点 */
    private _node: cc.Node = null;
    constructor() {
        super();
        Manager.eventDispatcher.addEventListener(EventApi.AdaptScreenEvent, this.onAdaptScreen, this);
    }
    private onAdaptScreen() {
        Manager.resolutionHelper.fullScreenAdapt(this._node);
    }
    private _isWaitingHide = false;
    private delay : number = null;
    private content: cc.Node = null;
    private text: cc.Label = null;
    private _isLoadingPrefab = false;
    private finishLoadCb = null;
    private _uiName = null;
    public preLoadPrefab() {
        this.loadPrefab();
    }

    /**
    * @description 显示全屏幕加载动画
    * @param delay 延迟显示时间 当为null时，不会显示loading进度，但会显示阻隔层 >0时为延迟显示的时间
    */
    public show( delay : number ,name : string) {
        this.delay = delay;
        this._uiName = name;
        this._show();
    }

    /**@description 加载界面超时时间,如果15秒未加载出，提示玩家加载超时 */
    private readonly TIME_OUT = 20;
    private _timerId = -1;

    /**
     * @description 显示动画
     * @param timeOut 超时加载时间。默认10为加载界面失败
     * @param timeOutCb 超时回调
     */
    private async _show() {
        this._isWaitingHide = false;
        let finish = await this.loadPrefab();
        if (finish) {
            Manager.resolutionHelper.fullScreenAdapt(this._node);
            this._node.removeFromParent();
            this._node.parent = Manager.uiManager.getCanvas();
            this._node.zIndex = ViewZOrder.UILoading;
            this._node.position = cc.Vec3.ZERO;
            this.content = cc.find("content", this._node);
            this.content.stopAllActions();
            this.text = cc.find("text", this.content).getComponent(cc.Label);
            this.text.string = "0%";
            this.content.opacity = 0;
            if ( this.delay != null && this.delay != undefined && this.delay > 0 ){
                cc.tween(this.content).delay(this.delay).set({ opacity: 255 }).start();
            }
            //第一次在预置体没加载好就被隐藏
            if (this._isWaitingHide) {
                // cc.error(`sssssssss`);
                this._isWaitingHide = false;
                this._node.active = false;
                return;
            }
            this.startTimeOutTimer(this.TIME_OUT);
            this._node.active = true;
        }
    }


    /**@description 开始计时回调 */
    private startTimeOutTimer(timeout: number) {
        this.stopTimeOutTimer();
        if (timeout) {
            this._timerId = setTimeout(() => {
                Manager.tips.show(`加载界面${this._uiName ? this._uiName : ""}超时，请重试`);
                this.hide();
                this._isWaitingHide = false;
            }, timeout * 1000);
        }
    }
    /**@description 停止计时 */
    private stopTimeOutTimer() {
        clearTimeout(this._timerId);
        this._timerId = -1;
    }

    /**
     * @description 加载
     * @param completeCb 
     */
    private async loadPrefab() {
        return new Promise<boolean>((resolove, reject) => {
            //正在加载中
            if (this._isLoadingPrefab) {
                cc.warn(`正在加载Loading预置体`);
                this.finishLoadCb = resolove;
                return;
            }
            if (this._node) {
                if (this.finishLoadCb) {
                    this.finishLoadCb(true);
                    this.finishLoadCb = null;
                }
                resolove(true);
                return;
            }
            this._isLoadingPrefab = true;
            Manager.assetManager.load(
                BUNDLE_RESOURCES, 
                Config.CommonPrefabs.uiLoading,
                cc.Prefab,
                (finish: number, total: number, item: cc.AssetManager.RequestItem)=>{},
                (data: ResourceCacheData) => {
                this._isLoadingPrefab = false;
                if (data && data.data && data.data instanceof cc.Prefab) {
                    this._node = cc.instantiate(data.data);
                    if (this.finishLoadCb) {
                        this.finishLoadCb(true);
                        this.finishLoadCb = null;
                    }
                    resolove(true);
                }
                else {
                    if (this.finishLoadCb) {
                        this.finishLoadCb(false);
                        this.finishLoadCb = null;
                    }
                    resolove(false);
                }
            });
        });
    }

    public hide() {
        this.stopTimeOutTimer();
        if (this._node) {
            if (this.content) this.content.stopAllActions();
            this._isWaitingHide = true;
            this._node.active = false;
        } else {
            //没有加载好预置体，置一个标记
            this._isWaitingHide = true;
        }
    }

    public updateProgress(progress: number) {
        if (this.text) {
            if (progress == undefined || progress == null || Number.isNaN(progress)) {
                this.hide();
                return;
            }
            if (progress >= 0 && progress <= 100) {
                this.text.string = `${progress}%`;
            }
        }
    }
}
