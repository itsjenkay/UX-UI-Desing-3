/*!
 * Shuffle.js by @Vestride
 * Categorize, sort, and filter a responsive grid of items.
 * Dependencies: jQuery 1.9+, Modernizr 2.6.2+
 * @license MIT license
 * @version 3.1.1
 */
(function(factory){if(typeof define==='function'&&define.amd){define(['jquery','modernizr'],factory);}else if(typeof exports==='object'){module.exports=factory(require('jquery'),window.Modernizr);}else{window.Shuffle=factory(window.jQuery,window.Modernizr);}})(function($,Modernizr,undefined){'use strict';if(typeof Modernizr!=='object'){throw new Error('Shuffle.js requires Modernizr.\n'+'http://vestride.github.io/Shuffle/#dependencies');}
function dashify(prop){if(!prop){return'';}
return prop.replace(/([A-Z])/g,function(str,m1){return'-'+m1.toLowerCase();}).replace(/^ms-/,'-ms-');}
var TRANSITION=Modernizr.prefixed('transition');var TRANSITION_DELAY=Modernizr.prefixed('transitionDelay');var TRANSITION_DURATION=Modernizr.prefixed('transitionDuration');var TRANSITIONEND={'WebkitTransition':'webkitTransitionEnd','transition':'transitionend'}[TRANSITION];var TRANSFORM=Modernizr.prefixed('transform');var CSS_TRANSFORM=dashify(TRANSFORM);var CAN_TRANSITION_TRANSFORMS=Modernizr.csstransforms&&Modernizr.csstransitions;var HAS_TRANSFORMS_3D=Modernizr.csstransforms3d;var HAS_COMPUTED_STYLE=!!window.getComputedStyle;var SHUFFLE='shuffle';var ALL_ITEMS='all';var FILTER_ATTRIBUTE_KEY='groups';var DEFAULT_SCALE=1;var CONCEALED_SCALE=0.001;function throttle(func,wait,options){var context,args,result;var timeout=null;var previous=0;options=options||{};var later=function(){previous=options.leading===false?0:$.now();timeout=null;result=func.apply(context,args);context=args=null;};return function(){var now=$.now();if(!previous&&options.leading===false){previous=now;}
var remaining=wait-(now-previous);context=this;args=arguments;if(remaining<=0||remaining>wait){clearTimeout(timeout);timeout=null;previous=now;result=func.apply(context,args);context=args=null;}else if(!timeout&&options.trailing!==false){timeout=setTimeout(later,remaining);}
return result;};}
function each(obj,iterator,context){for(var i=0,length=obj.length;i<length;i++){if(iterator.call(context,obj[i],i,obj)==={}){return;}}}
function defer(fn,context,wait){return setTimeout($.proxy(fn,context),wait);}
function arrayMax(array){return Math.max.apply(Math,array);}
function arrayMin(array){return Math.min.apply(Math,array);}
function getNumber(value){return $.isNumeric(value)?value:0;}
var getStyles=window.getComputedStyle||function(){};var Point=function(x,y){this.x=getNumber(x);this.y=getNumber(y);};Point.equals=function(a,b){return a.x===b.x&&a.y===b.y;};var COMPUTED_SIZE_INCLUDES_PADDING=(function(){if(!HAS_COMPUTED_STYLE){return false;}
var parent=document.body||document.documentElement;var e=document.createElement('div');e.style.cssText='width:10px;padding:2px;'+'-webkit-box-sizing:border-box;box-sizing:border-box;';parent.appendChild(e);var width=getStyles(e,null).width;var ret=width==='10px';parent.removeChild(e);return ret;}());var id=0;var $window=$(window);var Shuffle=function(element,options){options=options||{};$.extend(this,Shuffle.options,options,Shuffle.settings);this.$el=$(element);this.element=element;this.unique='shuffle_'+id++;this._fire(Shuffle.EventType.LOADING);this._init();defer(function(){this.initialized=true;this._fire(Shuffle.EventType.DONE);},this,16);};Shuffle.EventType={LOADING:'loading',DONE:'done',LAYOUT:'layout',REMOVED:'removed'};Shuffle.ClassName={BASE:SHUFFLE,SHUFFLE_ITEM:'shuffle-item',FILTERED:'filtered',CONCEALED:'concealed'};Shuffle.options={group:ALL_ITEMS,speed:250,easing:'ease-out',itemSelector:'',sizer:null,gutterWidth:0,columnWidth:0,delimeter:null,buffer:0,columnThreshold:HAS_COMPUTED_STYLE?0.01:0.1,initialSort:null,throttle:throttle,throttleTime:300,sequentialFadeDelay:150,supported:CAN_TRANSITION_TRANSFORMS};Shuffle.settings={useSizer:false,itemCss:{position:'absolute',top:0,left:0,visibility:'visible'},revealAppendedDelay:300,lastSort:{},lastFilter:ALL_ITEMS,enabled:true,destroyed:false,initialized:false,_animations:[],_transitions:[],_isMovementCanceled:false,styleQueue:[]};Shuffle.Point=Point;Shuffle._getItemTransformString=function(point,scale){if(HAS_TRANSFORMS_3D){return'translate3d('+point.x+'px, '+point.y+'px, 0) scale3d('+scale+', '+scale+', 1)';}else{return'translate('+point.x+'px, '+point.y+'px) scale('+scale+')';}};Shuffle._getNumberStyle=function(element,style,styles){if(HAS_COMPUTED_STYLE){styles=styles||getStyles(element,null);var value=Shuffle._getFloat(styles[style]);if(!COMPUTED_SIZE_INCLUDES_PADDING&&style==='width'){value+=Shuffle._getFloat(styles.paddingLeft)+
Shuffle._getFloat(styles.paddingRight)+
Shuffle._getFloat(styles.borderLeftWidth)+
Shuffle._getFloat(styles.borderRightWidth);}else if(!COMPUTED_SIZE_INCLUDES_PADDING&&style==='height'){value+=Shuffle._getFloat(styles.paddingTop)+
Shuffle._getFloat(styles.paddingBottom)+
Shuffle._getFloat(styles.borderTopWidth)+
Shuffle._getFloat(styles.borderBottomWidth);}
return value;}else{return Shuffle._getFloat($(element).css(style));}};Shuffle._getFloat=function(value){return getNumber(parseFloat(value));};Shuffle._getOuterWidth=function(element,includeMargins){var styles=getStyles(element,null);var width=Shuffle._getNumberStyle(element,'width',styles);if(includeMargins){var marginLeft=Shuffle._getNumberStyle(element,'marginLeft',styles);var marginRight=Shuffle._getNumberStyle(element,'marginRight',styles);width+=marginLeft+marginRight;}
return width;};Shuffle._getOuterHeight=function(element,includeMargins){var styles=getStyles(element,null);var height=Shuffle._getNumberStyle(element,'height',styles);if(includeMargins){var marginTop=Shuffle._getNumberStyle(element,'marginTop',styles);var marginBottom=Shuffle._getNumberStyle(element,'marginBottom',styles);height+=marginTop+marginBottom;}
return height;};Shuffle._skipTransition=function(element,callback,context){var duration=element.style[TRANSITION_DURATION];element.style[TRANSITION_DURATION]='0ms';callback.call(context);var reflow=element.offsetWidth;reflow=null;element.style[TRANSITION_DURATION]=duration;};Shuffle.prototype._init=function(){this.$items=this._getItems();this.sizer=this._getElementOption(this.sizer);if(this.sizer){this.useSizer=true;}
this.$el.addClass(Shuffle.ClassName.BASE);this._initItems();$window.on('resize.'+SHUFFLE+'.'+this.unique,this._getResizeFunction());var containerCSS=this.$el.css(['position','overflow']);var containerWidth=Shuffle._getOuterWidth(this.element);this._validateStyles(containerCSS);this._setColumns(containerWidth);this.shuffle(this.group,this.initialSort);if(this.supported){defer(function(){this._setTransitions();this.element.style[TRANSITION]='height '+this.speed+'ms '+this.easing;},this);}};Shuffle.prototype._getResizeFunction=function(){var resizeFunction=$.proxy(this._onResize,this);return this.throttle?this.throttle(resizeFunction,this.throttleTime):resizeFunction;};Shuffle.prototype._getElementOption=function(option){if(typeof option==='string'){return this.$el.find(option)[0]||null;}else if(option&&option.nodeType&&option.nodeType===1){return option;}else if(option&&option.jquery){return option[0];}
return null;};Shuffle.prototype._validateStyles=function(styles){if(styles.position==='static'){this.element.style.position='relative';}
if(styles.overflow!=='hidden'){this.element.style.overflow='hidden';}};Shuffle.prototype._filter=function(category,$collection){category=category||this.lastFilter;$collection=$collection||this.$items;var set=this._getFilteredSets(category,$collection);this._toggleFilterClasses(set.filtered,set.concealed);this.lastFilter=category;if(typeof category==='string'){this.group=category;}
return set.filtered;};Shuffle.prototype._getFilteredSets=function(category,$items){var $filtered=$();var $concealed=$();if(category===ALL_ITEMS){$filtered=$items;}else{each($items,function(el){var $item=$(el);if(this._doesPassFilter(category,$item)){$filtered=$filtered.add($item);}else{$concealed=$concealed.add($item);}},this);}
return{filtered:$filtered,concealed:$concealed};};Shuffle.prototype._doesPassFilter=function(category,$item){if($.isFunction(category)){return category.call($item[0],$item,this);}else{var groups=$item.data(FILTER_ATTRIBUTE_KEY);var keys=this.delimeter&&!$.isArray(groups)?groups.split(this.delimeter):groups;return $.inArray(category,keys)>-1;}};Shuffle.prototype._toggleFilterClasses=function($filtered,$concealed){$filtered.removeClass(Shuffle.ClassName.CONCEALED).addClass(Shuffle.ClassName.FILTERED);$concealed.removeClass(Shuffle.ClassName.FILTERED).addClass(Shuffle.ClassName.CONCEALED);};Shuffle.prototype._initItems=function($items){$items=$items||this.$items;$items.addClass([Shuffle.ClassName.SHUFFLE_ITEM,Shuffle.ClassName.FILTERED].join(' '));$items.css(this.itemCss).data('point',new Point()).data('scale',DEFAULT_SCALE);};Shuffle.prototype._updateItemCount=function(){this.visibleItems=this._getFilteredItems().length;};Shuffle.prototype._setTransition=function(element){element.style[TRANSITION]=CSS_TRANSFORM+' '+this.speed+'ms '+
this.easing+', opacity '+this.speed+'ms '+this.easing;};Shuffle.prototype._setTransitions=function($items){$items=$items||this.$items;each($items,function(el){this._setTransition(el);},this);};Shuffle.prototype._setSequentialDelay=function($collection){if(!this.supported){return;}
each($collection,function(el,i){el.style[TRANSITION_DELAY]='0ms,'+((i+1)*this.sequentialFadeDelay)+'ms';},this);};Shuffle.prototype._getItems=function(){return this.$el.children(this.itemSelector);};Shuffle.prototype._getFilteredItems=function(){return this.$items.filter('.'+Shuffle.ClassName.FILTERED);};Shuffle.prototype._getConcealedItems=function(){return this.$items.filter('.'+Shuffle.ClassName.CONCEALED);};Shuffle.prototype._getColumnSize=function(containerWidth,gutterSize){var size;if($.isFunction(this.columnWidth)){size=this.columnWidth(containerWidth);}else if(this.useSizer){size=Shuffle._getOuterWidth(this.sizer);}else if(this.columnWidth){size=this.columnWidth;}else if(this.$items.length>0){size=Shuffle._getOuterWidth(this.$items[0],true);}else{size=containerWidth;}
if(size===0){size=containerWidth;}
return size+gutterSize;};Shuffle.prototype._getGutterSize=function(containerWidth){var size;if($.isFunction(this.gutterWidth)){size=this.gutterWidth(containerWidth);}else if(this.useSizer){size=Shuffle._getNumberStyle(this.sizer,'marginLeft');}else{size=this.gutterWidth;}
return size;};Shuffle.prototype._setColumns=function(theContainerWidth){var containerWidth=theContainerWidth||Shuffle._getOuterWidth(this.element);var gutter=this._getGutterSize(containerWidth);var columnWidth=this._getColumnSize(containerWidth,gutter);var calculatedColumns=(containerWidth+gutter)/columnWidth;if(Math.abs(Math.round(calculatedColumns)-calculatedColumns)<this.columnThreshold){calculatedColumns=Math.round(calculatedColumns);}
this.cols=Math.max(Math.floor(calculatedColumns),1);this.containerWidth=containerWidth;this.colWidth=columnWidth;};Shuffle.prototype._setContainerSize=function(){this.$el.css('height',this._getContainerSize());};Shuffle.prototype._getContainerSize=function(){return arrayMax(this.positions);};Shuffle.prototype._fire=function(name,args){this.$el.trigger(name+'.'+SHUFFLE,args&&args.length?args:[this]);};Shuffle.prototype._resetCols=function(){var i=this.cols;this.positions=[];while(i--){this.positions.push(0);}};Shuffle.prototype._layout=function(items,isOnlyPosition){each(items,function(item){this._layoutItem(item,!!isOnlyPosition);},this);this._processStyleQueue();this._setContainerSize();};Shuffle.prototype._layoutItem=function(item,isOnlyPosition){var $item=$(item);var itemData=$item.data();var currPos=itemData.point;var currScale=itemData.scale;var itemSize={width:Shuffle._getOuterWidth(item,true),height:Shuffle._getOuterHeight(item,true)};var pos=this._getItemPosition(itemSize);if(Point.equals(currPos,pos)&&currScale===DEFAULT_SCALE){return;}
itemData.point=pos;itemData.scale=DEFAULT_SCALE;this.styleQueue.push({$item:$item,point:pos,scale:DEFAULT_SCALE,opacity:isOnlyPosition?0:1,skipTransition:isOnlyPosition||this.speed===0,callfront:function(){if(!isOnlyPosition){$item.css('visibility','visible');}},callback:function(){if(isOnlyPosition){$item.css('visibility','hidden');}}});};Shuffle.prototype._getItemPosition=function(itemSize){var columnSpan=this._getColumnSpan(itemSize.width,this.colWidth,this.cols);var setY=this._getColumnSet(columnSpan,this.cols);var shortColumnIndex=this._getShortColumn(setY,this.buffer);var point=new Point(Math.round(this.colWidth*shortColumnIndex),Math.round(setY[shortColumnIndex]));var setHeight=setY[shortColumnIndex]+itemSize.height;var setSpan=this.cols+1-setY.length;for(var i=0;i<setSpan;i++){this.positions[shortColumnIndex+i]=setHeight;}
return point;};Shuffle.prototype._getColumnSpan=function(itemWidth,columnWidth,columns){var columnSpan=itemWidth/columnWidth;if(Math.abs(Math.round(columnSpan)-columnSpan)<this.columnThreshold){columnSpan=Math.round(columnSpan);}
return Math.min(Math.ceil(columnSpan),columns);};Shuffle.prototype._getColumnSet=function(columnSpan,columns){if(columnSpan===1){return this.positions;}else{var groupCount=columns+1-columnSpan;var groupY=[];for(var i=0;i<groupCount;i++){groupY[i]=arrayMax(this.positions.slice(i,i+columnSpan));}
return groupY;}};Shuffle.prototype._getShortColumn=function(positions,buffer){var minPosition=arrayMin(positions);for(var i=0,len=positions.length;i<len;i++){if(positions[i]>=minPosition-buffer&&positions[i]<=minPosition+buffer){return i;}}
return 0;};Shuffle.prototype._shrink=function($collection){var $concealed=$collection||this._getConcealedItems();each($concealed,function(item){var $item=$(item);var itemData=$item.data();if(itemData.scale===CONCEALED_SCALE){return;}
itemData.scale=CONCEALED_SCALE;this.styleQueue.push({$item:$item,point:itemData.point,scale:CONCEALED_SCALE,opacity:0,callback:function(){$item.css('visibility','hidden');}});},this);};Shuffle.prototype._onResize=function(){if(!this.enabled||this.destroyed){return;}
var containerWidth=Shuffle._getOuterWidth(this.element);if(containerWidth===this.containerWidth){return;}
this.update();};Shuffle.prototype._getStylesForTransition=function(opts){var styles={opacity:opts.opacity};if(this.supported){styles[TRANSFORM]=Shuffle._getItemTransformString(opts.point,opts.scale);}else{styles.left=opts.point.x;styles.top=opts.point.y;}
return styles;};Shuffle.prototype._transition=function(opts){var styles=this._getStylesForTransition(opts);this._startItemAnimation(opts.$item,styles,opts.callfront||$.noop,opts.callback||$.noop);};Shuffle.prototype._startItemAnimation=function($item,styles,callfront,callback){var _this=this;function handleTransitionEnd(evt){if(evt.target===evt.currentTarget){$(evt.target).off(TRANSITIONEND,handleTransitionEnd);_this._removeTransitionReference(reference);callback();}}
var reference={$element:$item,handler:handleTransitionEnd};callfront();if(!this.initialized){$item.css(styles);callback();return;}
if(this.supported){$item.css(styles);$item.on(TRANSITIONEND,handleTransitionEnd);this._transitions.push(reference);}else{var anim=$item.stop(true).animate(styles,this.speed,'swing',callback);this._animations.push(anim.promise());}};Shuffle.prototype._processStyleQueue=function(noLayout){if(this.isTransitioning){this._cancelMovement();}
var $transitions=$();each(this.styleQueue,function(transitionObj){if(transitionObj.skipTransition){this._styleImmediately(transitionObj);}else{$transitions=$transitions.add(transitionObj.$item);this._transition(transitionObj);}},this);if($transitions.length>0&&this.initialized&&this.speed>0){this.isTransitioning=true;if(this.supported){this._whenCollectionDone($transitions,TRANSITIONEND,this._movementFinished);}else{this._whenAnimationsDone(this._movementFinished);}}else if(!noLayout){defer(this._layoutEnd,this);}
this.styleQueue.length=0;};Shuffle.prototype._cancelMovement=function(){if(this.supported){each(this._transitions,function(transition){transition.$element.off(TRANSITIONEND,transition.handler);});}else{this._isMovementCanceled=true;this.$items.stop(true);this._isMovementCanceled=false;}
this._transitions.length=0;this.isTransitioning=false;};Shuffle.prototype._removeTransitionReference=function(ref){var indexInArray=$.inArray(ref,this._transitions);if(indexInArray>-1){this._transitions.splice(indexInArray,1);}};Shuffle.prototype._styleImmediately=function(opts){Shuffle._skipTransition(opts.$item[0],function(){opts.$item.css(this._getStylesForTransition(opts));},this);};Shuffle.prototype._movementFinished=function(){this.isTransitioning=false;this._layoutEnd();};Shuffle.prototype._layoutEnd=function(){this._fire(Shuffle.EventType.LAYOUT);};Shuffle.prototype._addItems=function($newItems,addToEnd,isSequential){this._initItems($newItems);this._setTransitions($newItems);this.$items=this._getItems();this._shrink($newItems);each(this.styleQueue,function(transitionObj){transitionObj.skipTransition=true;});this._processStyleQueue(true);if(addToEnd){this._addItemsToEnd($newItems,isSequential);}else{this.shuffle(this.lastFilter);}};Shuffle.prototype._addItemsToEnd=function($newItems,isSequential){var $passed=this._filter(null,$newItems);var passed=$passed.get();this._updateItemCount();this._layout(passed,true);if(isSequential&&this.supported){this._setSequentialDelay(passed);}
this._revealAppended(passed);};Shuffle.prototype._revealAppended=function(newFilteredItems){defer(function(){each(newFilteredItems,function(el){var $item=$(el);this._transition({$item:$item,opacity:1,point:$item.data('point'),scale:DEFAULT_SCALE});},this);this._whenCollectionDone($(newFilteredItems),TRANSITIONEND,function(){$(newFilteredItems).css(TRANSITION_DELAY,'0ms');this._movementFinished();});},this,this.revealAppendedDelay);};Shuffle.prototype._whenCollectionDone=function($collection,eventName,callback){var done=0;var items=$collection.length;var self=this;function handleEventName(evt){if(evt.target===evt.currentTarget){$(evt.target).off(eventName,handleEventName);done++;if(done===items){self._removeTransitionReference(reference);callback.call(self);}}}
var reference={$element:$collection,handler:handleEventName};$collection.on(eventName,handleEventName);this._transitions.push(reference);};Shuffle.prototype._whenAnimationsDone=function(callback){$.when.apply(null,this._animations).always($.proxy(function(){this._animations.length=0;if(!this._isMovementCanceled){callback.call(this);}},this));};Shuffle.prototype.shuffle=function(category,sortObj){if(!this.enabled){return;}
if(!category){category=ALL_ITEMS;}
this._filter(category);this._updateItemCount();this._shrink();this.sort(sortObj);};Shuffle.prototype.sort=function(opts){if(this.enabled){this._resetCols();var sortOptions=opts||this.lastSort;var items=this._getFilteredItems().sorted(sortOptions);this._layout(items);this.lastSort=sortOptions;}};Shuffle.prototype.update=function(isOnlyLayout){if(this.enabled){if(!isOnlyLayout){this._setColumns();}
this.sort();}};Shuffle.prototype.layout=function(){this.update(true);};Shuffle.prototype.appended=function($newItems,addToEnd,isSequential){this._addItems($newItems,addToEnd===true,isSequential!==false);};Shuffle.prototype.disable=function(){this.enabled=false;};Shuffle.prototype.enable=function(isUpdateLayout){this.enabled=true;if(isUpdateLayout!==false){this.update();}};Shuffle.prototype.remove=function($collection){if(!$collection.length||!$collection.jquery){return;}
function handleRemoved(){$collection.remove();this.$items=this._getItems();this._updateItemCount();this._fire(Shuffle.EventType.REMOVED,[$collection,this]);$collection=null;}
this._toggleFilterClasses($(),$collection);this._shrink($collection);this.sort();this.$el.one(Shuffle.EventType.LAYOUT+'.'+SHUFFLE,$.proxy(handleRemoved,this));};Shuffle.prototype.destroy=function(){$window.off('.'+this.unique);this.$el.removeClass(SHUFFLE).removeAttr('style').removeData(SHUFFLE);this.$items.removeAttr('style').removeData('point').removeData('scale').removeClass([Shuffle.ClassName.CONCEALED,Shuffle.ClassName.FILTERED,Shuffle.ClassName.SHUFFLE_ITEM].join(' '));this.$items=null;this.$el=null;this.sizer=null;this.element=null;this._transitions=null;this.destroyed=true;};$.fn.shuffle=function(opts){var args=Array.prototype.slice.call(arguments,1);return this.each(function(){var $this=$(this);var shuffle=$this.data(SHUFFLE);if(!shuffle){shuffle=new Shuffle(this,opts);$this.data(SHUFFLE,shuffle);}else if(typeof opts==='string'&&shuffle[opts]){shuffle[opts].apply(shuffle,args);}});};function randomize(array){var tmp,current;var top=array.length;if(!top){return array;}
while(--top){current=Math.floor(Math.random()*(top+1));tmp=array[current];array[current]=array[top];array[top]=tmp;}
return array;}
$.fn.sorted=function(options){var opts=$.extend({},$.fn.sorted.defaults,options);var arr=this.get();var revert=false;if(!arr.length){return[];}
if(opts.randomize){return randomize(arr);}
if($.isFunction(opts.by)){arr.sort(function(a,b){if(revert){return 0;}
var valA=opts.by($(a));var valB=opts.by($(b));if(valA===undefined&&valB===undefined){revert=true;return 0;}
if(valA<valB||valA==='sortFirst'||valB==='sortLast'){return-1;}
if(valA>valB||valA==='sortLast'||valB==='sortFirst'){return 1;}
return 0;});}
if(revert){return this.get();}
if(opts.reverse){arr.reverse();}
return arr;};$.fn.sorted.defaults={reverse:false,by:null,randomize:false};return Shuffle;});