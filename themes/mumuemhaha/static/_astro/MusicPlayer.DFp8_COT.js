import{o as Mt,b as Lt,p as $,a as N,f as Nt,s as B,c as zt}from"./disclose-version.DvPGzt6h.js";import{i as Kt}from"./legacy.Bz9P1j0_.js";import{w as jt,ar as Xt,bq as Ot,br as Wt,q as qt,u as Ut,bs as Yt,bt as Gt,a0 as kt,bu as lt,bv as It,b as et,aj as _t,aa as Qt,c as w,g as n,d as p,r as h,a as C,p as rt,s as xt,f as T,ad as st,ae as tt,o as A,t as I,ah as Y,ai as z,ak as ft,m as Jt,af as Zt,bw as $t,as as te,Q as yt}from"./utils.D5AawdQR.js";import{a as ee,s as W}from"./render.CABOKHYz.js";import{i as F}from"./if.CTlYVAQl.js";import{I as V}from"./Icon.Kv_9fiED.js";import{m as ht}from"./config.BEhK3e3B.js";import{m as P}from"./musicPlayerStore.PPEBL_hy.js";import{S as re,a as ie,b as ne,c as ae,d as oe,C as wt,P as le,e as se,N as ue,s as ce}from"./SidebarTrackInfo.-DhkFU7n.js";import{I as J}from"./zh_TW.DQhvB9P3.js";import{i as Z}from"./translation.DBO1O_4o.js";import{a as de}from"./actions.D6LUK7ah.js";import{e as ge,i as ve}from"./each.Dv23FJl3.js";const me=()=>performance.now(),U={tick:r=>requestAnimationFrame(r),now:()=>me(),tasks:new Set};function Dt(){const r=U.now();U.tasks.forEach(t=>{t.c(r)||(U.tasks.delete(t),t.f())}),U.tasks.size!==0&&U.tick(Dt)}function fe(r){let t;return U.tasks.size===0&&U.tick(Dt),{promise:new Promise(e=>{U.tasks.add(t={c:r,f:e})}),abort(){U.tasks.delete(t)}}}function mt(r,t){It(()=>{r.dispatchEvent(new CustomEvent(t))})}function be(r){if(r==="float")return"cssFloat";if(r==="offset")return"cssOffset";if(r.startsWith("--"))return r;const t=r.split("-");return t.length===1?t[0]:t[0]+t.slice(1).map(e=>e[0].toUpperCase()+e.slice(1)).join("")}function Pt(r){const t={},e=r.split(";");for(const l of e){const[a,o]=l.split(":");if(!a||o===void 0)break;const v=be(a.trim());t[v]=o.trim()}return t}const ye=r=>r;function Rt(r,t,e,l){var a=(r&Yt)!==0,o="both",v,c=t.inert,b=t.style.overflow,i,u;function d(){return It(()=>v??=e()(t,l?.()??{},{direction:o}))}var m={is_global:a,in(){t.inert=c,i=pt(t,d(),u,1,()=>{mt(t,"introstart")},()=>{mt(t,"introend"),i?.abort(),i=v=void 0,t.style.overflow=b})},out(S){t.inert=!0,u=pt(t,d(),i,0,()=>{mt(t,"outrostart")},()=>{mt(t,"outroend"),S?.()})},stop:()=>{i?.abort(),u?.abort()}},g=jt;if((g.nodes.t??=[]).push(m),ee){var x=a;if(!x){for(var s=g.parent;s&&(s.f&Xt)!==0;)for(;(s=s.parent)&&(s.f&Ot)===0;);x=!s||(s.f&Wt)!==0}x&&qt(()=>{Ut(()=>m.in())})}}function pt(r,t,e,l,a,o){var v=l===1,c=!1;if(Gt(t)){var b;return kt(()=>{if(!c){var s=t({direction:v?"in":"out"});b=pt(r,s,e,l,a,o)}}),{abort:()=>{c=!0,b?.abort()},deactivate:()=>b.deactivate(),reset:()=>b.reset(),t:()=>b.t()}}if(e?.deactivate(),!t?.duration&&!t?.delay)return a(),o(),{abort:lt,deactivate:lt,reset:lt,t:()=>l};const{delay:i=0,css:u,tick:d,easing:m=ye}=t;var g,x=()=>1-l;return kt(()=>{if(!c){var s=[];if(v&&e===void 0&&(d&&d(0,1),u)){var S=Pt(u(0,1));s.push(S,S)}g=r.animate(s,{duration:i,fill:"forwards"}),g.onfinish=()=>{g.cancel(),a();var y=e?.t()??1-l;e?.abort();var L=l-y,k=t.duration*Math.abs(L),f=[];if(k>0){var E=!1;if(u)for(var D=Math.ceil(k/16.666666666666668),it=0;it<=D;it+=1){var ut=y+L*m(it/D),ct=Pt(u(ut,1-ut));f.push(ct),E||=ct.overflow==="hidden"}E&&(r.style.overflow="hidden"),x=()=>{var nt=g.currentTime;return y+L*m(nt/k)},d&&fe(()=>{if(g.playState!=="running")return!1;var nt=x();return d(nt,1-nt),!0})}g=r.animate(f,{duration:k,fill:"forwards"}),g.onfinish=()=>{x=()=>l,d?.(l,1-l),o()}}}}),{abort:()=>{c=!0,g&&(g.cancel(),g.effect=null,g.onfinish=lt)},deactivate:()=>{o=lt},reset:()=>{l===0&&d?.(1,0)},t:()=>x()}}function he(r){const t=r-1;return t*t*t+1}function Vt(r){const t=r-1;return t*t*t+1}function Ct(r){const t=typeof r=="string"&&r.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);return t?[parseFloat(t[1]),t[2]||"px"]:[r,"px"]}function at(r,t,e){return Number.isNaN(t)?"":`${r}: ${e*t}px;`}function xe(r,{delay:t=0,duration:e=400,easing:l=Vt,x:a=0,y:o=0,opacity:v=0}={}){const c=getComputedStyle(r),b=+c.opacity,i=c.transform==="none"?"":c.transform,u=b*(1-v),[d,m]=Ct(a),[g,x]=Ct(o);return{delay:t,duration:e,easing:l,css:(s,S)=>`
			transform: ${i} translate(${(1-s)*d}${m}, ${(1-s)*g}${x});
			opacity: ${b-u*S}`}}function we(r,{delay:t=0,duration:e=400,easing:l=Vt,axis:a="y"}={}){const o=getComputedStyle(r),v=+o.opacity,c=a==="y"?"height":"width",b=parseFloat(o[c]),i=a==="y"?["top","bottom"]:["left","right"],u=i.map(y=>`${y[0].toUpperCase()}${y.slice(1)}`),d=parseFloat(o[`padding${u[0]}`]),m=parseFloat(o[`padding${u[1]}`]),g=parseFloat(o[`margin${u[0]}`]),x=parseFloat(o[`margin${u[1]}`]),s=parseFloat(o[`border${u[0]}Width`]),S=parseFloat(o[`border${u[1]}Width`]);return{delay:t,duration:e,easing:l,css:y=>`overflow: hidden;opacity: ${Math.min(y*20,1)*v};`+at(c,b,y)+at(`padding-${i[0]}`,d,y)+at(`padding-${i[1]}`,m,y)+at(`margin-${i[0]}`,g,y)+at(`margin-${i[1]}`,x,y)+at(`border-${i[0]}-width`,s,y)+at(`border-${i[1]}-width`,S,y)+`min-${c}: 0`}}var pe=T('<div class="fab-music-panel card-base shadow-xl rounded-2xl p-4 w-[20rem] max-w-[80vw] svelte-1lty5dg"><div class="fab-music-header svelte-1lty5dg"><!> <!></div> <!> <!> <!></div>');function ke(r,t){et(t,!0);let e=_t(Qt(P.getState())),l=_t(!1);function a(E){const D=E;D.detail&&xt(e,D.detail,!0)}Mt(()=>{window.addEventListener("music-sidebar:state",a)}),Lt(()=>{typeof window<"u"&&window.removeEventListener("music-sidebar:state",a)});function o(){P.toggle()}function v(){P.prev()}function c(){P.next()}function b(){P.toggleMode()}function i(){xt(l,!n(l))}function u(E){P.playIndex(E)}function d(E){P.seek(E)}function m(){P.toggleMute()}function g(E){P.setVolume(E)}var x=pe(),s=w(x),S=w(s);re(S,{get currentSong(){return n(e).currentSong},get isPlaying(){return n(e).isPlaying},get isLoading(){return n(e).isLoading}});var y=p(S,2);ie(y,{get currentSong(){return n(e).currentSong},get currentTime(){return n(e).currentTime},get duration(){return n(e).duration},get volume(){return n(e).volume},get isMuted(){return n(e).isMuted},onToggleMute:m,onSetVolume:g}),h(s);var L=p(s,2);ne(L,{get currentTime(){return n(e).currentTime},get duration(){return n(e).duration},onSeek:d});var k=p(L,2);ae(k,{get isPlaying(){return n(e).isPlaying},get isShuffled(){return n(e).isShuffled},get repeatMode(){return n(e).isRepeating},onToggleMode:b,onPrev:v,onNext:c,onTogglePlay:o,onTogglePlaylist:i});var f=p(k,2);oe(f,{get playlist(){return n(e).playlist},get currentIndex(){return n(e).currentIndex},get isPlaying(){return n(e).isPlaying},get show(){return n(l)},onClose:i,onPlaySong:u}),h(x),C(r,x),rt()}var _e=T('<div class="flex-1 min-w-0"><div class="text-sm font-medium text-90 truncate"> </div> <div class="text-xs text-50 truncate"> </div></div>'),Pe=T('<div class="text-xs text-30 mt-1"> </div>'),Ce=T('<div class="flex-1 min-w-0"><div class="song-title text-lg font-bold text-90 truncate mb-1"> </div> <div class="song-artist text-sm text-50 truncate"> </div> <!></div>');function St(r,t){et(t,!0);const e=$(t,"showTime",3,!1),l=$(t,"size",3,"mini");function a(i){if(!Number.isFinite(i)||i<0)return"0:00";const u=Math.floor(i/60),d=Math.floor(i%60);return`${u}:${d.toString().padStart(2,"0")}`}var o=st(),v=tt(o);{var c=i=>{var u=_e(),d=w(u),m=A(d,!0),g=p(d,2),x=A(g,!0);h(u),I(()=>{W(m,t.song.title),W(x,t.song.artist)}),C(i,u)},b=i=>{var u=Ce(),d=w(u),m=A(d,!0),g=p(d,2),x=A(g,!0),s=p(g,2);{var S=y=>{var L=Pe(),k=A(L);I((f,E)=>W(k,`${f??""} / ${E??""}`),[()=>a(t.currentTime),()=>a(t.duration)]),C(y,L)};F(s,y=>{e()&&y(S)})}h(u),I(()=>{W(m,t.song.title),W(x,t.song.artist)}),C(i,u)};F(v,i=>{l()==="mini"?i(c):i(b,-1)})}C(r,o),rt()}var Se=T('<!> <div class="flex-1 min-w-0 cursor-pointer" role="button" tabindex="0"><!></div> <div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button></div>',1),Te=T('<div class="flex items-center gap-1"><button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button> <button><!></button></div>'),Ee=T("<!> <!> <!>",1),Me=T("<div><!></div>");function Ht(r,t){et(t,!0);const e=$(t,"size",3,"mini"),l=$(t,"showControls",3,!1),a=$(t,"showPlaylist",3,!1);var o=Me(),v=w(o);{var c=i=>{var u=Se(),d=tt(u);wt(d,{get cover(){return t.song.cover},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"mini",interactive:!0,get onclick(){return t.onCoverClick}});var m=p(d,2),g=w(m);St(g,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},size:"mini"}),h(m);var x=p(m,2),s=w(x),S=w(s);V(S,{icon:"material-symbols:visibility-off",class:"text-lg"}),h(s);var y=p(s,2),L=w(y);V(L,{icon:"material-symbols:expand-less",class:"text-lg"}),h(y),h(x),I((k,f)=>{B(m,"aria-label",k),B(s,"title",f)},[()=>Z(J.musicPlayerExpand),()=>Z(J.musicPlayerHide)]),z("click",m,function(...k){t.onInfoClick?.apply(this,k)}),z("keydown",m,k=>{(k.key==="Enter"||k.key===" ")&&(k.preventDefault(),t.onInfoClick?.())}),z("click",s,k=>{k.stopPropagation(),t.onHideClick?.()}),z("click",y,k=>{k.stopPropagation(),t.onExpandClick?.()}),C(i,u)},b=i=>{var u=Ee(),d=tt(u);wt(d,{get cover(){return t.song.cover},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"expanded"});var m=p(d,2);St(m,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},showTime:!0,size:"expanded"});var g=p(m,2);{var x=s=>{var S=Te(),y=w(S),L=w(y);V(L,{icon:"material-symbols:visibility-off",class:"text-lg"}),h(y);var k=p(y,2);let f;var E=w(k);V(E,{icon:"material-symbols:queue-music",class:"text-lg"}),h(k),h(S),I((D,it)=>{B(y,"title",D),f=N(k,1,"btn-plain w-8 h-8 rounded-lg flex items-center justify-center",null,f,{"text-[var(--primary)]":a()}),B(k,"title",it)},[()=>Z(J.musicPlayerHide),()=>Z(J.musicPlayerPlaylist)]),z("click",y,function(...D){t.onHideClick?.apply(this,D)}),z("click",k,function(...D){t.onPlaylistClick?.apply(this,D)}),C(s,S)};F(g,s=>{l()&&s(x)})}C(i,u)};F(v,i=>{e()==="mini"?i(c):i(b,-1)})}h(o),I(()=>N(o,1,Nt(e()==="mini"?"flex items-center gap-3 mb-0":"flex items-center gap-4 mb-4"))),C(r,o),rt()}Y(["click","keydown"]);var Le=T("<div><!></div>");function ze(r,t){var e=Le();let l;var a=w(e);Ht(a,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"mini",get onCoverClick(){return t.onCoverClick},get onInfoClick(){return t.onInfoClick},get onHideClick(){return t.onHideClick},get onExpandClick(){return t.onExpandClick}}),h(e),I(()=>l=N(e,1,"mini-player card-base shadow-xl rounded-2xl p-3 absolute bottom-0 right-0 w-[17.5rem] svelte-g9ac72",null,l,{"mini-enter":!t.isHidden,"mini-leave":t.isHidden,"pointer-events-none":t.isHidden})),C(r,e)}var Tt=T("<button><!></button>");function Et(r,t){const e=$(t,"repeatMode",3,0),l=$(t,"disabled",3,!1);var a=st(),o=tt(a);{var v=b=>{var i=Tt();let u;var d=w(i);V(d,{icon:"material-symbols:shuffle",class:"text-lg"}),h(i),I(()=>{u=N(i,1,"w-10 h-10 rounded-lg",null,u,{"btn-regular":t.isActive,"btn-plain":!t.isActive}),i.disabled=l()}),z("click",i,function(...m){t.onclick?.apply(this,m)}),C(b,i)},c=b=>{var i=Tt();let u;var d=w(i);{var m=s=>{V(s,{icon:"material-symbols:repeat-one",class:"text-lg"})},g=s=>{V(s,{icon:"material-symbols:repeat",class:"text-lg"})},x=s=>{V(s,{icon:"material-symbols:repeat",class:"text-lg opacity-50"})};F(d,s=>{e()===1?s(m):e()===2?s(g,1):s(x,-1)})}h(i),I(()=>u=N(i,1,"w-10 h-10 rounded-lg",null,u,{"btn-regular":t.isActive,"btn-plain":!t.isActive})),z("click",i,function(...s){t.onclick?.apply(this,s)}),C(b,i)};F(o,b=>{t.mode==="shuffle"?b(v):b(c,-1)})}C(r,a)}Y(["click"]);var Ie=T('<div class="controls flex items-center justify-center gap-2 mb-4"><!> <!> <!> <!> <!></div>');function De(r,t){var e=Ie(),l=w(e);Et(l,{mode:"shuffle",get isActive(){return t.isShuffled},get onclick(){return t.onShuffleClick}});var a=p(l,2);le(a,{get onclick(){return t.onPrevClick},disabled:!1});var o=p(a,2);se(o,{get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},get onclick(){return t.onPlayClick}});var v=p(o,2);ue(v,{get onclick(){return t.onNextClick},disabled:!1});var c=p(v,2);{let b=ft(()=>t.isRepeating>0);Et(c,{mode:"repeat",get isActive(){return n(b)},get repeatMode(){return t.isRepeating},get onclick(){return t.onRepeatClick}})}h(e),C(r,e)}var Re=T('<div class="progress-bar flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div class="h-full bg-[var(--primary)] rounded-full transition-all duration-100"></div></div>');function Ve(r,t){et(t,!0);var e=Re(),l=A(e);I(a=>{B(e,"aria-label",a),B(e,"aria-valuenow",t.duration>0?t.currentTime/t.duration*100:0),zt(l,`width: ${t.duration>0?t.currentTime/t.duration*100:0}%`)},[()=>Z(J.musicPlayerProgress)]),z("click",e,function(...a){t.onclick?.apply(this,a)}),z("keydown",e,function(...a){t.onkeydown?.apply(this,a)}),C(r,e),rt()}Y(["click","keydown"]);var He=T('<div class="progress-section mb-4"><!></div>');function Be(r,t){var e=He(),l=w(e);Ve(l,{get currentTime(){return t.currentTime},get duration(){return t.duration},get onclick(){return t.onProgressClick},get onkeydown(){return t.onProgressKeyDown}}),h(e),C(r,e)}var Fe=T('<button class="btn-plain w-8 h-8 rounded-lg"><!></button>');function Ae(r,t){var e=Fe(),l=w(e);{var a=c=>{V(c,{icon:"material-symbols:volume-off",class:"text-lg"})},o=c=>{V(c,{icon:"material-symbols:volume-down",class:"text-lg"})},v=c=>{V(c,{icon:"material-symbols:volume-up",class:"text-lg"})};F(l,c=>{t.isMuted||t.volume===0?c(a):t.volume<.5?c(o,1):c(v,-1)})}h(e),z("click",e,function(...c){t.onclick?.apply(this,c)}),C(r,e)}Y(["click"]);var Ne=T('<div class="flex-1 h-2 bg-[var(--btn-regular-bg)] rounded-full cursor-pointer touch-none" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"><div></div></div>');function Ke(r,t){var e=Ne(),l=w(e);let a;h(e),de(e,o=>t.volumeBarRef?.(o)),I(()=>{B(e,"aria-label",t.ariaLabel),B(e,"aria-valuenow",t.volume*100),a=N(l,1,"h-full bg-[var(--primary)] rounded-full transition-all",null,a,{"duration-100":!t.isVolumeDragging,"duration-0":t.isVolumeDragging}),zt(l,`width: ${t.volume*100}%`)}),z("pointerdown",e,function(...o){t.onpointerdown?.apply(this,o)}),z("keydown",e,function(...o){t.onkeydown?.apply(this,o)}),C(r,e)}Y(["pointerdown","keydown"]);var je=T('<div class="bottom-controls flex items-center gap-2"><!> <!> <!></div>');function Xe(r,t){var e=je(),l=w(e);Ae(l,{get volume(){return t.volume},get isMuted(){return t.isMuted},get onclick(){return t.onVolumeButtonClick}});var a=p(l,2);{let v=ft(()=>t.isMuted?0:t.volume);Ke(a,{get volume(){return n(v)},get isVolumeDragging(){return t.isVolumeDragging},get volumeBarRef(){return t.volumeBarRef},get onpointerdown(){return t.onSliderPointerDown},get onkeydown(){return t.onSliderKeyDown},get ariaLabel(){return t.ariaLabel}})}var o=p(a,2);ce(o,t,"default",{}),h(e),C(r,e)}var Oe=T('<button class="btn-plain w-8 h-8 rounded-lg flex items-center justify-center"><!></button>'),We=T("<div><!> <!> <!> <!></div>");function qe(r,t){et(t,!0);var e=We();let l;var a=w(e);Ht(a,{get song(){return t.song},get currentTime(){return t.currentTime},get duration(){return t.duration},get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},size:"expanded",showControls:!0,get showPlaylist(){return t.showPlaylist},get onHideClick(){return t.onHideClick},get onPlaylistClick(){return t.onPlaylistClick}});var o=p(a,2);Be(o,{get currentTime(){return t.currentTime},get duration(){return t.duration},get onProgressClick(){return t.onProgressClick},get onProgressKeyDown(){return t.onProgressKeyDown}});var v=p(o,2);De(v,{get isPlaying(){return t.isPlaying},get isLoading(){return t.isLoading},get isShuffled(){return t.isShuffled},get isRepeating(){return t.isRepeating},get onPlayClick(){return t.onPlayClick},get onPrevClick(){return t.onPrevClick},get onNextClick(){return t.onNextClick},get onShuffleClick(){return t.onShuffleClick},get onRepeatClick(){return t.onRepeatClick}});var c=p(v,2);{let b=ft(()=>Z(J.musicPlayerVolume));Xe(c,{get volume(){return t.volume},get isMuted(){return t.isMuted},get isVolumeDragging(){return t.isVolumeDragging},get volumeBarRef(){return t.volumeBarRef},get onVolumeButtonClick(){return t.onVolumeButtonClick},get onSliderPointerDown(){return t.onSliderPointerDown},get onSliderKeyDown(){return t.onSliderKeyDown},get ariaLabel(){return n(b)},children:(i,u)=>{var d=Oe(),m=w(d);V(m,{icon:"material-symbols:expand-more",class:"text-lg"}),h(d),I(g=>B(d,"title",g),[()=>Z(J.musicPlayerCollapse)]),z("click",d,function(...g){t.onCollapseClick?.apply(this,g)}),C(i,d)},$$slots:{default:!0}})}h(e),I(()=>l=N(e,1,"expanded-player card-base shadow-xl rounded-2xl p-4 transition-all duration-500 ease-in-out absolute bottom-0 right-0 w-80",null,l,{"opacity-0":t.isHidden,"scale-95":t.isHidden,"pointer-events-none":t.isHidden})),C(r,e),rt()}Y(["click"]);var Ue=T('<span class="text-sm text-[var(--content-meta)]"> </span>'),Ye=T('<div role="button" tabindex="0"><div class="w-6 h-6 flex items-center justify-center"><!></div> <div class="w-10 h-10 rounded-lg overflow-hidden bg-[var(--btn-regular-bg)] flex-shrink-0"><img decoding="async" class="w-full h-full object-cover"/></div> <div class="flex-1 min-w-0"><div> </div> <div> </div></div></div>');function Ge(r,t){et(t,!0);const e=$(t,"lazy",3,!0);function l(f){return f.startsWith("http://")||f.startsWith("https://")||f.startsWith("/")?f:`/${f}`}var a=Ye();let o;var v=w(a),c=w(v);{var b=f=>{V(f,{icon:"material-symbols:graphic-eq",class:"text-[var(--primary)] animate-pulse"})},i=f=>{V(f,{icon:"material-symbols:pause",class:"text-[var(--primary)]"})},u=f=>{var E=Ue(),D=A(E,!0);I(()=>W(D,t.index+1)),C(f,E)};F(c,f=>{t.isCurrent&&t.isPlaying?f(b):t.isCurrent?f(i,1):f(u,-1)})}h(v);var d=p(v,2),m=A(d),g=p(d,2),x=w(g);let s;var S=A(x,!0),y=p(x,2);let L;var k=A(y,!0);h(g),h(a),I(f=>{o=N(a,1,"playlist-item flex items-center gap-3 p-3 hover:bg-[var(--btn-plain-bg-hover)] cursor-pointer transition-colors",null,o,{"bg-[var(--btn-plain-bg)]":t.isCurrent,"text-[var(--primary)]":t.isCurrent}),B(a,"aria-label",`播放 ${t.song.title??""} - ${t.song.artist??""}`),B(m,"src",f),B(m,"alt",t.song.title),B(m,"loading",e()?"lazy":"eager"),s=N(x,1,"font-medium truncate",null,s,{"text-[var(--primary)]":t.isCurrent,"text-90":!t.isCurrent}),W(S,t.song.title),L=N(y,1,"text-sm text-[var(--content-meta)] truncate",null,L,{"text-[var(--primary)]":t.isCurrent}),W(k,t.song.artist)},[()=>l(t.song.cover)]),z("click",a,function(...f){t.onclick?.apply(this,f)}),z("keydown",a,f=>{(f.key==="Enter"||f.key===" ")&&(f.preventDefault(),t.onclick())}),C(r,a),rt()}Y(["click","keydown"]);var Qe=T('<div class="playlist-panel card-base-transparent fixed bottom-70 right-4 w-80 max-h-96 overflow-hidden z-50 svelte-1v267om"><div class="playlist-header flex items-center justify-between p-4 border-b border-[var(--line-divider)]"><h3 class="text-lg font-semibold text-90"> </h3> <button class="btn-plain w-8 h-8 rounded-lg"><!></button></div> <div class="playlist-content overflow-y-auto max-h-80 hide-scrollbar" role="presentation"></div></div>');function Je(r,t){et(t,!0);var e=st(),l=tt(e);{var a=o=>{var v=Qe(),c=w(v),b=w(c),i=A(b,!0),u=p(b,2),d=w(u);V(d,{icon:"material-symbols:close",class:"text-lg"}),h(u),h(c);var m=p(c,2);ge(m,21,()=>t.playlist,ve,(g,x,s)=>{{let S=ft(()=>s===t.currentIndex);Ge(g,{get song(){return n(x)},index:s,get isCurrent(){return n(S)},get isPlaying(){return t.isPlaying},onclick:()=>t.onPlaySong(s),lazy:s!==0})}}),h(m),h(v),I(g=>W(i,g),[()=>Z(J.musicPlayerPlaylist)]),z("click",u,function(...g){t.onClose?.apply(this,g)}),Rt(3,v,()=>we,()=>({duration:300,axis:"y"})),C(o,v)};F(l,o=>{t.show&&o(a)})}C(r,e),rt()}Y(["click"]);var Ze=T('<div class="fixed bottom-20 right-4 z-[60] max-w-sm"><div class="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up"><!> <span class="text-sm flex-1"> </span> <button class="text-white/80 hover:text-white transition-colors"><!></button></div></div>'),$e=T('<div class="music-player-fab-anchor fixed z-[55]"><div class="music-player-fab-shell"><!></div></div>'),tr=T("<div><div><!></div> <!> <!> <!></div>"),er=T(`<!> <!> <style>.music-player-fab-anchor {
			right: var(--fab-group-right, 1.5rem);
			bottom: calc(
				var(--fab-group-bottom, 10rem) +
					(
						var(--fab-button-size, 3rem) *
							var(--fab-visible-count, 1)
					) +
					(
						var(--fab-group-gap, 0.5rem) *
							(var(--fab-visible-count, 1) - 1)
					)
			);
			width: 0;
			height: 0;
			pointer-events: none;
		}

		.music-player-fab-shell {
			position: absolute;
			right: 0;
			bottom: 0.75rem;
			transform-origin: bottom right;
			pointer-events: auto;
			will-change: transform, opacity;
		}

		.orb-player-container {
			position: absolute;
			bottom: 0;
			right: 0;
		}

		.orb-enter {
			animation: orbElasticIn 460ms cubic-bezier(0.22, 1.25, 0.36, 1)
				forwards;
		}

		.orb-leave {
			animation: orbElasticOut 360ms cubic-bezier(0.4, 0, 1, 1) forwards;
		}

		@keyframes orbElasticIn {
			0% {
				opacity: 0;
				transform: translateX(0) scale(0.55);
			}
			70% {
				opacity: 1;
				transform: translateX(0) scale(1.12);
			}
			100% {
				opacity: 1;
				transform: translateX(0) scale(1);
			}
		}

		@keyframes orbElasticOut {
			0% {
				opacity: 1;
				transform: translateX(0) scale(1);
			}
			100% {
				opacity: 0;
				transform: translateX(0) scale(0.6);
			}
		}

		.music-player.hidden-mode {
			width: 3rem;
			height: 3rem;
		}

		.music-player {
			width: 20rem;
			max-width: 20rem;
			min-width: 20rem;
			user-select: none;
		}

		:global(.mini-player) {
			position: absolute;
			bottom: 0;
			right: 0;
		}

		:global(.expanded-player) {
			position: absolute;
			bottom: 0;
			right: 0;
		}

		:global(.orb-player) {
			position: relative;
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
		}

		:global(.orb-player::before) {
			content: "";
			position: absolute;
			inset: -0.125rem;
			background: linear-gradient(
				45deg,
				var(--primary),
				transparent,
				var(--primary)
			);
			border-radius: 50%;
			z-index: -1;
			opacity: 0;
			transition: opacity 0.3s ease;
		}

		:global(.orb-player:hover::before) {
			opacity: 0.3;
			animation: rotate 2s linear infinite;
		}

		:global(.orb-player .animate-pulse) {
			animation: musicWave 1.5s ease-in-out infinite;
		}

		@keyframes rotate {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}

		@keyframes musicWave {
			0%,
			100% {
				transform: scaleY(0.5);
			}
			50% {
				transform: scaleY(1);
			}
		}

		:global(.animate-pulse) {
			animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		}

		@keyframes pulse {
			0%,
			100% {
				opacity: 1;
			}
			50% {
				opacity: 0.5;
			}
		}

		:global(.progress-section div:hover),
		:global(.bottom-controls > div:hover) {
			transform: scaleY(1.2);
			transition: transform 0.2s ease;
		}

		@media (max-width: 768px) {
			.music-player-fab-anchor {
				right: var(--fab-group-right, 0.75rem) !important;
				bottom: calc(
					var(--fab-group-bottom, 5rem) +
						(
							var(--fab-button-size, 2.75rem) *
								var(--fab-visible-count, 1)
						) +
						(
							var(--fab-group-gap, 0.5rem) *
								(var(--fab-visible-count, 1) - 1)
						)
				) !important;
			}

			.music-player-fab-shell {
				right: 0 !important;
				bottom: 0.75rem !important;
			}

			.music-player {
				width: 280px !important;
				min-width: 280px !important;
				max-width: 280px !important;
				bottom: 0.5rem !important;
				right: 0.5rem !important;
			}
			:global(.mini-player) {
				width: 280px !important;
			}
			:global(.expanded-player) {
				width: 280px !important;
				max-width: 280px !important;
			}
			.music-player.expanded {
				width: 280px !important;
				min-width: 280px !important;
				max-width: 280px !important;
				right: 0.5rem !important;
			}
			:global(.playlist-panel) {
				width: 280px !important;
				right: 0.5rem !important;
				max-width: 280px !important;
			}
			:global(.controls) {
				gap: 8px;
			}
			:global(.controls button) {
				width: 36px;
				height: 36px;
			}
			:global(.controls button:nth-child(3)) {
				width: 44px;
				height: 44px;
			}
		}

		@media (max-width: 480px) {
			.music-player-fab-anchor {
				right: var(--fab-group-right, 0.5rem) !important;
				bottom: calc(
					var(--fab-group-bottom, 4.5rem) +
						(
							var(--fab-button-size, 2.5rem) *
								var(--fab-visible-count, 1)
						) +
						(
							var(--fab-group-gap, 0.5rem) *
								(var(--fab-visible-count, 1) - 1)
						)
				) !important;
			}

			.music-player-fab-shell {
				right: 0 !important;
				bottom: 0.75rem !important;
			}

			.music-player {
				width: 260px !important;
				min-width: 260px !important;
				max-width: 260px !important;
			}
			:global(.expanded-player) {
				width: 260px !important;
				max-width: 260px !important;
			}
			:global(.playlist-panel) {
				width: 260px !important;
				max-width: 260px !important;
				right: 0.5rem !important;
			}
			:global(.song-title) {
				font-size: 14px;
			}
			:global(.song-artist) {
				font-size: 12px;
			}
			:global(.controls) {
				gap: 6px;
				margin-bottom: 12px;
			}
			:global(.controls button) {
				width: 32px;
				height: 32px;
			}
			:global(.controls button:nth-child(3)) {
				width: 40px;
				height: 40px;
			}
			:global(.playlist-item) {
				padding: 8px 12px;
			}
			:global(.playlist-item .w-10) {
				width: 32px;
				height: 32px;
			}
		}

		@keyframes slide-up {
			from {
				transform: translateY(100%);
				opacity: 0;
			}
			to {
				transform: translateY(0);
				opacity: 1;
			}
		}

		.animate-slide-up {
			animation: slide-up 0.3s ease-out;
		}

		@media (hover: none) and (pointer: coarse) {
			:global(.music-player button),
			:global(.playlist-item) {
				min-height: 44px;
			}
			:global(.progress-section > div),
			:global(.bottom-controls > div:nth-child(2)) {
				height: 12px;
			}
		}

		@keyframes spin-continuous {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}

		:global(.cover-container img) {
			animation: spin-continuous 3s linear infinite;
			animation-play-state: paused;
		}

		:global(.cover-container img.spinning) {
			animation-play-state: running;
		}

		:global(button.bg-\\\\[var\\\\(--primary\\\\)\\\\]) {
			box-shadow: 0 0 0 2px var(--primary);
			border: none;
		}</style>`,1);function fr(r,t){et(t,!1);let e=Jt(P.getState());const l=ht.showFloatingPlayer,o=(ht.floatingEntryMode??"default")==="fab",v=l&&ht.enable;let c;function b(){P.toggle()}function i(){P.prev()}function u(){P.next()}function d(){P.toggleShuffle()}function m(){P.toggleRepeat()}function g(_){P.playIndex(_)}function x(_){const R=_.currentTarget;if(!R)return;const q=R.getBoundingClientRect(),X=(_.clientX-q.left)/q.width;P.setProgress(X)}function s(_){(_.key==="Enter"||_.key===" ")&&(_.preventDefault(),P.setProgress(.5))}function S(){P.toggleMute()}function y(){P.toggleMute()}function L(_){const R=_.currentTarget;if(!R)return;const q=M=>{const K=R.getBoundingClientRect();if(K.width<=0)return;const j=Math.max(0,Math.min(1,(M-K.left)/K.width));P.setVolume(j)};q(_.clientX);const X=_.pointerId;R.setPointerCapture(X);const dt=M=>{M.pointerId===X&&q(M.clientX)},gt=()=>{R.removeEventListener("pointermove",dt),R.removeEventListener("pointerup",vt),R.removeEventListener("pointercancel",H),R.hasPointerCapture(X)&&R.releasePointerCapture(X)},vt=M=>{M.pointerId===X&&(q(M.clientX),gt())},H=M=>{M.pointerId===X&&gt()};R.addEventListener("pointermove",dt),R.addEventListener("pointerup",vt),R.addEventListener("pointercancel",H)}function k(_){if(_.key==="ArrowLeft"||_.key==="ArrowDown"){_.preventDefault(),P.setVolume(n(e).volume-.05);return}if(_.key==="ArrowRight"||_.key==="ArrowUp"){_.preventDefault(),P.setVolume(n(e).volume+.05);return}(_.key==="Enter"||_.key===" "||_.key==="m"||_.key==="M")&&(_.preventDefault(),S())}function f(){P.togglePlaylist()}function E(){P.toggleExpanded()}function D(){P.toggleHidden()}function it(){P.hideError()}function ut(_){}function ct(){return P.canSkip()}Mt(()=>{c=P.subscribe(_=>{xt(e,_)}),P.initialize()}),Lt(()=>{c&&c(),P.destroy()}),Kt();var nt=st();Zt("keydown",$t,k);var Bt=tt(nt);{var Ft=_=>{var R=er(),q=tt(R);{var X=H=>{var M=Ze(),K=w(M),j=w(K);V(j,{icon:"material-symbols:error",class:"text-xl flex-shrink-0"});var G=p(j,2),Q=A(G,!0),O=p(G,2),ot=w(O);V(ot,{icon:"material-symbols:close",class:"text-lg"}),h(O),h(K),h(M),I(()=>W(Q,n(e).errorMessage)),z("click",O,it),C(H,M)};F(q,H=>{n(e).showError&&H(X)})}var dt=p(q,2);{var gt=H=>{var M=st(),K=tt(M);{var j=G=>{var Q=$e(),O=w(Q),ot=w(O);ke(ot,{}),h(O),h(Q),Rt(3,O,()=>xe,()=>({y:16,duration:280,opacity:.12,easing:he})),C(G,Q)};F(K,G=>{n(e).isExpanded&&G(j)})}C(H,M)},vt=H=>{var M=tr();let K;var j=w(M),G=w(j);wt(G,{get cover(){return n(e).currentSong.cover},get isPlaying(){return n(e).isPlaying},get isLoading(){return n(e).isLoading},size:"orb",onclick:D}),h(j);var Q=p(j,2);{let bt=yt(()=>n(e).isExpanded||n(e).isHidden);ze(Q,{get song(){return n(e).currentSong},get currentTime(){return n(e).currentTime},get duration(){return n(e).duration},get isPlaying(){return n(e).isPlaying},get isLoading(){return n(e).isLoading},get isHidden(){return n(bt)},onCoverClick:b,onInfoClick:E,onHideClick:D,onExpandClick:E})}var O=p(Q,2);{let bt=yt(ct),At=yt(()=>!n(e).isExpanded);qe(O,{get song(){return n(e).currentSong},get currentTime(){return n(e).currentTime},get duration(){return n(e).duration},get isPlaying(){return n(e).isPlaying},get isLoading(){return n(e).isLoading},get isShuffled(){return n(e).isShuffled},get isRepeating(){return n(e).isRepeating},get showPlaylist(){return n(e).showPlaylist},get canSkip(){return n(bt)},get volume(){return n(e).volume},get isMuted(){return n(e).isMuted},isVolumeDragging:!1,get isHidden(){return n(At)},volumeBarRef:ut,onPlayClick:b,onPrevClick:i,onNextClick:()=>u(),onShuffleClick:d,onRepeatClick:m,onProgressClick:x,onProgressKeyDown:s,onVolumeButtonClick:y,onSliderPointerDown:L,onSliderKeyDown:k,onHideClick:D,onPlaylistClick:f,onCollapseClick:E})}var ot=p(O,2);Je(ot,{get playlist(){return n(e).playlist},get currentIndex(){return n(e).currentIndex},get isPlaying(){return n(e).isPlaying},get show(){return n(e).showPlaylist},onClose:f,onPlaySong:g}),h(M),I(()=>{K=N(M,1,"music-player fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out",null,K,{expanded:n(e).isExpanded,"hidden-mode":n(e).isHidden}),N(j,1,`orb-player-container ${n(e).isHidden?"orb-enter pointer-events-auto":"orb-leave pointer-events-none"}`)}),C(H,M)};F(dt,H=>{o?H(gt):H(vt,-1)})}te(2),C(_,R)};F(Bt,_=>{v&&_(Ft)})}C(r,nt),rt()}Y(["click"]);export{fr as default};
