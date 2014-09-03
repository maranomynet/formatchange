/* FormatChange  -- (c) 2012-2014 Hugsmiðjan ehf.   @license MIT/GPL */
!function(){"use strict";var e=window,t=document,a=!!e.addEventListener,r=Object.create||function(e){var t=function(){};return t.prototype=e,new t},n=function(e,t){var a=this;return this instanceof n?(t=t||{},t.elmTagName&&(a.elmTagName=t.elmTagName),t.elmId&&(a.elmId=t.elmId),"defer"in t&&(a.defer=t.defer),a.formatGroups=e?e:r(a.formatGroups),a.media={},a._callbacks=[],a._$hdl=function(){a._getFormat()},!a.defer&&a.start(),void 0):new n(e,t)};n.prototype={elmTagName:"del",elmId:"mediaformat",defer:!1,formatGroups:{},isRunning:function(){return this._on},start:function(r){var n=this;if(!n._on){var o=n._elm=t.createElement(n.elmTagName||"del"),i=o.style;i.position="absolute",i.visibility="hidden",i.width=0,o.id=n.elmId||"mediaformat",t.body.appendChild(o),n._on=!0,a?e.addEventListener("resize",n._$hdl):e.attachEvent("onresize",n._$hdl),n.refresh(r)}},stop:function(){var t=this,r=t._elm;t._on&&(a?e.removeEventListener("resize",t._$hdl):e.detachEvent("onresize",t._$hdl),r.parentNode.removeChild(r),delete t._elm,t._on=!1)},refresh:function(e){e&&(this.oldFormat=null),this._getFormat(),this._updateFlags()},subscribe:function(e){var t=this;t.unsubscribe(e),t._callbacks.push(e),t._on&&e(t.media)},unsubscribe:function(e){for(var t,a=this._callbacks,r=0;t=a[r];r++)if(t===e){a.splice(r,1);break}},_on:!1,_updateFlags:function(){var e=this,t=e.media,a=e.formatGroups;for(var r in a){var n=a[r],o=!(!n||!n[t.format]),i=!(!n||!n[t.lastFormat]);t["is"+r]=o,t["was"+r]=i,t["became"+r]=o&&!i,t["left"+r]=!o&&i,!n&&delete a[r]}},_getFormat:function(){var t=this,a=t.media,r=t.oldFormat,n=t._elm,o=e.getComputedStyle,i=(o&&o(n,":after").getPropertyValue("content")||(o?o(n,null).getPropertyValue("fontFamily"):n.currentStyle.fontFamily)||"").replace(/['"]/g,"");if(i!==r){a.format=i,a.lastFormat=r,t.oldFormat=i,t._updateFlags();for(var l,s=0;l=t._callbacks[s];s++)l(a)}}},n.jQueryPlugin=function(t,a){var r={};t.formatChange=function(o,i){i=i||{};var l=i.eventName||a||"formatchange";if(!r[l]){var s=r[l]=new n(o,i);s.subscribe(function(a){t(e).trigger(l,[a])}),t.event.special[l]={add:function(a){s._on&&a.handler.call(e,t.Event(l),s.media)}}}return s}},"object"==typeof module&&"object"==typeof module.exports?module.exports=n:(e.FormatChange=n,e.jQuery&&n.jQueryPlugin(e.jQuery))}();