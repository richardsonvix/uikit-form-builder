(function(){
	
	"use strict";
	
	var builder = {
		components : {},
		selected : $(".ukfb-canvas"),
		getRandomId : function(){
			var len = 10;
			var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
			var maxPos = chars.length;
			var str = '';
			for (var i = 0; i < len; i++) {
				str += chars.charAt(Math.floor(Math.random() * maxPos));
			}
			return str;
		},
		getComponent : function(el){
			var compName = el.attr("data-component");
			var component = builder.components[compName];
			if(component == undefined){
				throw new Error("Unsupported component : " + compName);
			}
			component.name = compName;
			return component;
		},
		renderAttrForm : function(comp,data){
			if(data == undefined){
				data = comp.attrs.defaultVal;
			}
			var el = null;
			if(comp.attrs.render != undefined){
				el = comp.attrs.render(data);
			}else{
				var template = Handlebars.compile(comp.attrs.template);
				var html = template(data);
				el = $(html);
			}
			return el;
		},
		renderComponent : function(comp,data){
			if(data == undefined){
				data = comp.attrs.defaultVal;
			}
			var el = null;
			if(comp.render != undefined){
				el = comp.render(data);
			}else{
				var template = Handlebars.compile(comp.template);
				var html = template(data);
				el = $(html);
			}
			if(comp.init != undefined){
				comp.init(el);
			}
			return el;
		},
		init : function(){
			builder.initCanvas();
			builder.initDragAndDrop();
			builder.initRootComponent();
			builder.initAttrForm();
		},
		
		initDragAndDrop : function(){
			
			var drag = dragula([],{
				isContainer: function (el) {
					var isCanvasContainer = $(el).hasClass("uk-panel") && $(el).closest("[data-component='canvas']").length > 0;
					var isNavContainer = $(el).hasClass("ukfb-component-nav");
					return isCanvasContainer || isNavContainer;
				},
				copy : true,
				moves : function(el, source, handle, sibling) {
					var isComponent = $(el).attr("data-component") != undefined;
					var isNavItem = $(el).closest(".ukfb-component-nav").length > 0;
					return  isComponent && isNavItem;
				},
				accepts : function(el, target, source, sibling) {
					return true;
				},
				invalid : function(el, handle) {
					return false;
				},
			});
			
			drag
			.on("over",function(el, container, source){
				
			})
			.on("out",function(el, container, source){
				
			})
			.on("drop",function(el, target, source, sibling){
				$(el).remove();
				var comp = builder.getComponent($(el));
				var el = builder.renderComponent(comp);
				el.data("data",comp.attrs.defaultVal);
				$(target).append(el);
			})
		},
		initRootComponent : function(){
			var root = builder.components["canvas"];
			var el = builder.renderAttrForm(root);
			var canvas = builder.renderComponent(root);
			canvas.addClass("ukfb-component-selected");
			
			$(".ukfb-canvas").append(canvas);
			$(".ukfb-attr-form").attr("data-component","canvas");
			$(".ukfb-attr-form").prepend(el);
			$(".ukfb-attr-nav .uk-nav-header").text(root.text);
		},
		initCanvas : function(){
			$(".ukfb-canvas")
			.delegate("[data-component]","mouseover",function(e){
				e.stopPropagation();
				$(this).addClass("ukfb-component-hover");
			})
			.delegate("[data-component]","mouseout",function(e){
				e.stopPropagation();
				$(this).removeClass("ukfb-component-hover");
			})
			.delegate("[data-component]","click",function(e){
				e.stopPropagation();
				$(".ukfb-canvas .ukfb-component-selected").removeClass("ukfb-component-selected");
				$(this).removeClass("ukfb-component-hover");
				$(this).addClass("ukfb-component-selected");
				
				$(".ukfb-canvas .uk-close").remove();
				if($(this).attr("data-component") != "canvas"){
					$(this).append('<a href="javascript:;" class="uk-close"></a>');
				}
				builder.setAttrForm($(this));
			})
			.delegate(".uk-close", "click",function(){
				$(this).closest("[data-component]").remove();
				
			});
		},
		initAttrForm : function(el){
			$(".ukfb-attr-form .ukfb-component-apply").on("click",function(){
				var attrForm = $(this).closest(".ukfb-attr-form");
				var arr = attrForm.serializeArray();
				var json = {};
				for (var i = 0; i < arr.length; i++) {
					json[arr[i].name] = arr[i].value;
				}
				var component = builder.getComponent(attrForm);
				var el = builder.renderComponent(component, json);
				var selected = $(".ukfb-canvas .ukfb-component-selected");
				selected.html(el.html());
				selected.append('<a href="javascript:;" class="uk-close"></a>');
				selected.data("data",json);
			});
		},
		setAttrForm : function(el){
			var component = builder.getComponent(el);
			var attrEl = builder.renderAttrForm(component, el.data("data"));
			var compName = el.attr("data-component");
			
			$(".ukfb-attr-form > *:not(.ukfb-component-apply)").remove();
			$(".ukfb-attr-form").attr("data-component",compName)
			$(".ukfb-attr-form").prepend(attrEl);
			$(".ukfb-attr-nav .uk-nav-header").text(component.text);
			
		}
	};
	
	builder.components.canvas = function(){
		var canvas = {
				
			text : '画布',
				
			attrs : {
				defaultVal : {
					'cols' : 2,
					'class' :'',
					'gutter' : 'uk-grid-small'
				},
				template : '<div class="uk-form-row"><label class="uk-form-label">伪类</label>'
					+ '<div class="uk-form-controls"><input type="text" name="class" value="{{class}}"></div></div>'
					+ '<div class="uk-form-row"><label class="uk-form-label">列<span style="color:red">(改变后会清楚里面所有内容)</span></label>'
					+ '<div class="uk-form-controls"><input type="text" name="cols" value="{{cols}}"></div></div>'
					+ '<div class="uk-form-row"><label class="uk-form-label">间隔</label>'
					+ '<div class="uk-form-controls"><select name="gutter">'
					+ '<option {{#js_compare "this.gutter == \'uk-grid-medium\'"}} selected="true" {{/js_compare}} value="uk-grid-medium">uk-grid-medium</option>'
					+ '<option {{#js_compare "this.gutter == \'uk-grid-small\'"}} selected="true" {{/js_compare}} value="uk-grid-small">uk-grid-small</option>'
					+ '<option {{#js_compare "this.gutter == \'uk-grid-collapse\'"}} selected="true" {{/js_compare}} value="uk-grid-collapse">uk-grid-collapse</option>'
					+ '</select></div></div>',
			},
			
			template : '<div data-component="canvas">' 
				+ '<div class="uk-grid {{gutter}} {{class}}">'
				+ '{{#each columns}}'
				+ '<div class="uk-width-1-{{cols}}">'
				+ '<div class="uk-panel uk-panel-box"></div>'
				+ '</div>'
				+ '{{/each}}'
				+ '</div>'
				+ '</div>',
		
			render : function(data){
				var template = Handlebars.compile(canvas.template);
				if(data == undefined){
					data = canvas.attrs;
				}
				var columns = [];
				for (var i = 1; i <= data.cols; i++) {
					columns.push({
						cols : data.cols
					});
				}
				data.columns = columns;
				var html = template(data);
				return $(html);
			}
		}
		
		return canvas;
	}();
	
	window.UKBuilder = builder;
	builder.init();
	
})();