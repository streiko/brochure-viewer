var BrochureWidget = function(vars) {
  var o = this;
  o.brochureVars = vars;

  o.brochureHolder = vars.brochureHolder;

  o.pageWidth = vars.pageWidth || 300;
  o.pageHeight = vars.pageHeight || 400;

  o.currentSlide = 0;

  o.goToSlide = function(msg, e) {
    e = e || "";
    if (o.zoomedIn) o.resize();

    switch (msg) {
      case "next":
        o.currentSlide++;
        break;
      case "prev":
        o.currentSlide--;
        break;
      default:
        o.currentSlide = parseInt(msg);
        break;
    }

    if (o.currentSlide < 0) {
      o.currentSlide = o.brochureLength - 1;
    } else if (o.currentSlide >= o.brochureLength) {
      o.currentSlide = 0;
    }

    for (var i = 0; i < o.pages.length; i++) {
      o.pages[i].style.left = -(o.currentSlide * 100) + "%";
    }

    o.currentSlideWidth = o.slides[o.currentSlide].length == 1 ? o.pageWidth : o.pageWidth * 2;

    var previousFocusedPages = document.querySelectorAll(".focus");
    for (var j = 0; j < previousFocusedPages.length; j++) {
      previousFocusedPages[j].classList.remove("focus");
    }

    for (var h = 0; h < o.slides[o.currentSlide].length; h++) {
      o.slides[o.currentSlide][h].classList.add("focus");
    }

    o.dispatch("pageTurn", e);
  };

  o.resize = function() {
    o.brochureWidth = o.brochureHolder.offsetWidth;
    o.brochureHeight = o.brochureHolder.offsetHeight;

    if (o.brochureWidth / o.brochureHeight < o.pageRatio) {
      o.scaleFactor = o.brochureVars.doublePage ? o.brochureWidth / o.pageWidth / 2 : o.brochureWidth / o.pageWidth;
    } else {
      o.scaleFactor = o.brochureHeight / o.pageHeight;
    }

    for (var i = 0; i < o.pages.length; i++) {
      o.pages[i].style.transform = "scale(" + o.scaleFactor + ")";
    }

    o.pageSize = {
      // need to store the original/ unzoomed pagesize to for zooming
      width: o.pageWidth * o.scaleFactor,
      height: o.pageHeight * o.scaleFactor
    };

    o.currentSlideWidth = o.slides[o.currentSlide].length == 1 ? o.pageWidth : o.pageWidth * 2;

    o.zoomedIn = false;

    o.brochureHolder.classList.remove("zoomedIn");

    o.currentZoom = o.tempZoom = 1;
  };
  o.on = function(event, func) {
    o.brochureHolder.addEventListener(event, func);
  };
  o.dispatch = function(eventName, e) {
    e = e || "";
    var newEvent = new CustomEvent(eventName, {
      detail: {
        currentSlide: o.currentSlide,
        zoom: o.tempZoom,
        type: e.type || undefined
      }
    });
    o.brochureHolder.dispatchEvent(newEvent);
  };
  o.composedPath = function(el) {
    var path = [];
    while (el) {
      path.push(el);
      if (el.tagName === "HTML") {
        path.push(document);
        path.push(window);
        return path;
      }
      el = el.parentElement;
    }
  };
  o.getOrientation = function(e) {
    var path = e.path || o.composedPath(e.target);
    for (var j = 0; j < path.length; j++) {
      var element = path[j];
      if (element.orientation) {
        return element.orientation;
      }
    }
    return;
  };
  o.pageSetup = function() {
    

    var j = 0;
    var h = 0;

    for (var i = 0; i < o.pages.length; i++) {
      o.pages[i].style = ""; //get rid of any inline styles. needed for reinitialisation
      o.pages[i].classList.remove("left", "right", "center");
      

      if (o.brochureVars.doublePage) {
        //organize pages in slides-array
        if (!o.slides[j]) {
          o.slides[j] = [];
        }
        o.slides[j][h] = o.pages[i];
        if (h == 1 || (j == 0 && !o.brochureVars.doublePageCover)) {
          j++;
          h = 0;
        } else {
          h++;
        }
      } else {
        o.slides[i] = [o.pages[i]];
      }

      o.pages[i].style.width = o.pageWidth + "px";
      o.pages[i].style.height = o.pageHeight + "px";
      if (o.brochureVars.doublePage) {
        var even = i % 2 == 0;
        if (o.brochureVars.doublePageCover) {
          //doublepages & doublepagecover
          if (i == o.pages.length - 1 && even) {
            o.pages[i].orientation = "center";
          } else {
            if (even) {
              o.pages[i].orientation = "left";
            } else {
              o.pages[i].orientation = "right";
            }
          }
        } else {
          if (i == 0 || (i == o.pages.length - 1 && !even)) {
            //doublepage & singlepagecover
            o.pages[i].orientation = "center";
          } else {
            if (!even) {
              o.pages[i].orientation = "left";
            } else {
              o.pages[i].orientation = "right";
            }
          }
        }
      } else {
        o.pages[i].orientation = "center"; //singlepage
      }

      switch (o.pages[i].orientation) {
        case "center":
          o.pages[i].className += " center";
          o.pages[i].style.margin = -o.pageHeight / 2 + "px calc(50% - " + o.pageWidth / 2 + "px)";
          break;
        case "left":
          o.pages[i].className += " left"; //50% 0px 0px calc(50% - 300px);
          o.pages[i].style.margin = -o.pageHeight / 2 + "px 0 0 calc(50% - " + o.pageWidth + "px)";
          break;
        default:
          o.pages[i].className += " right";
          o.pages[i].style.margin = -o.pageHeight / 2 + "px calc(50% - " + o.pageWidth + "px) 0 0";
          break;
      }

      o.pages[i].className += " brochure-page";
      


      var clickToZoom = function(target) {
        var clickHandler = function(e){
          o.clickToZoom(e, target, 2);
        }
        o.pages[i].removeEventListener("click", clickHandler);
        if (o.brochureVars.zoom) {
          console.log("add")
          console.log(target)
          o.pages[i].addEventListener("click", clickHandler);
          //target.removeEventListener("click", clickHandler);
        }
      };

      clickToZoom(o.pages[i]);


    }
  };
  o.pinchToZoom = function(e, zoom) {
    if (zoom < 1.2) {
      for (var i = 0; i < o.slides[o.currentSlide].length; i++) {
        o.slides[o.currentSlide][i].style.transform = "scale(" + o.scaleFactor * 1 + ")";
      }
      o.brochureHolder.classList.remove("zoomedIn");
      o.zoomedIn = false;
    } else {
      var orientation = o.getOrientation(e);

      var x = o.pinchStartPos.x / o.currentZoom;
      var y = o.pinchStartPos.y / o.currentZoom;

      var pageWidth = orientation == "center" ? o.pageSize.width : o.pageSize.width * 2;

      var zoomOrigin = {
        x: Math.max(Math.min((x / pageWidth - 0.5) * 1.15, 0.5), -0.5), // varies from -0.5 to 0.5
        y: Math.max(Math.min((y / o.pageSize.height - 0.5) * 1.15, 0.5), -0.5)
      };

      o.zoom(zoom, zoomOrigin);

      o.zoomedIn = true;
    }
  };
  o.clickToZoom = function(e, target, zoom) {
    console.log(e)
    console.log(target)
    var ignoreClick = false;
    if (!o.zoomedIn && !o.dragging) {
      var path = e.path || o.composedPath(e.target);
      for (var j = 0; j < path.length; j++) {
        var element = path[j];
        if (element.classList) {
          if (element.classList.value.indexOf("nozoom") != -1) {
            ignoreClick = true;
            break;
          }
        }
      }

      if (!ignoreClick) {
        var orientation = o.getOrientation(e);

        var rect = target.getBoundingClientRect(); // target != e.target

        var x = e.clientX - rect.left + (orientation == "right" ? rect.width : 0); // + (e.target.orientation == "right")?rect.width:0; //x position within the element.
        var y = e.clientY - rect.top; //y position within the element.

        var pageWidth = orientation == "center" ? o.pageSize.width : o.pageSize.width * 2;

        var zoomOrigin = {
          x: Math.max(Math.min((x / pageWidth - 0.5) * 1.15, 0.5), -0.5), // varies from -0.5 to 0.5
          y: Math.max(Math.min((y / o.pageSize.height - 0.5) * 1.15, 0.5), -0.5)
        };

        o.zoom(zoom, zoomOrigin);

        o.zoomedIn = true;

        
      }
    } else if (!o.dragging) {
      o.resize();
    }
    if(!ignoreClick) o.dispatch("zoom", e);

  };
  o.zoom = function(zoom, zoomOrigin) {
    // console.log("zoom:"+zoom+" x:"+zoomOrigin.x+" y:"+zoomOrigin.y+ " zoomedIn:"+ o.zoomedIn);

    o.brochureWidth = o.brochureHolder.offsetWidth;
    o.brochureHeight = o.brochureHolder.offsetHeight;

    var pageWidth = o.slides[o.currentSlide].length == 1 ? o.pageSize.width : o.pageSize.width * 2;

    var overlapLeft = (o.brochureWidth - pageWidth * zoom) / (o.scaleFactor * zoom);

    var overlapTop = (o.brochureHeight - o.pageSize.height * zoom) / (o.scaleFactor * zoom); // = zoomed page height - brochure height

    if (overlapTop >= 0) overlapTop = 0; // prevent repos if not necessary
    if (overlapLeft >= 0) overlapLeft = 0;

    var pageOverlap = {
      top: overlapTop,
      left: overlapLeft
    };

    for (var i = 0; i < o.slides[o.currentSlide].length; i++) {
      o.slides[o.currentSlide][i].style.transform =
        "scale(" +
        o.scaleFactor * zoom +
        ") translate(" +
        pageOverlap.left * zoomOrigin.x +
        "px, " +
        pageOverlap.top * zoomOrigin.y +
        "px)";
    }

    o.brochureHolder.classList.add("zoomedIn");

    o.tempZoom = zoom;

    o.tempZoomOrigin = zoomOrigin;
  };
  o.broschureNavigation = function() {
    var pinchStartDist = 0;
    var startDragPos = {}; //holds clientX and clientY in dragStart
    var dragOffset = {}; //will store the dragged distance x and y // 0 - 100

    o.brochureHolder.addEventListener("mousedown", startDrag);
    o.brochureHolder.addEventListener("touchstart", function(e) {
      if (e.touches.length === 2) {
        stopDrag();
        startPinch(e);
      } else {
        startDrag(e);
      }
    });

    function startPinch(e) {
      pinchStartDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);

      o.currentZoom = o.tempZoom || 1;
      o.currentZoomOrigin = o.tempZoomOrigin || { x: 0, y: 0 };

      o.pinchStartPos = {
        x: (e.touches[0].pageX + e.touches[1].pageX) / 2 - o.slides[o.currentSlide][0].getBoundingClientRect().left,
        y: (e.touches[0].pageY + e.touches[1].pageY) / 2 - o.slides[o.currentSlide][0].getBoundingClientRect().top
      };

      o.brochureHolder.addEventListener("touchmove", pinchMove);
      o.brochureHolder.addEventListener("touchend", stopPinch);
    }

    function stopPinch(e) {
      o.brochureHolder.removeEventListener("touchmove", pinchMove);
      o.brochureHolder.removeEventListener("touchend", stopPinch);
      o.dispatch("zoom", e);
      // console.log("stopPinch");
    }

    function pinchMove(e) {
      var pinchDist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
      var zoomBy = o.currentZoom + (pinchDist - pinchStartDist) / 100;
      o.pinchToZoom(e, zoomBy);
    }

    function startDrag(e) {
      // console.log("startDrag");
      e.preventDefault();

      dragOffset.x = 0;

      o.currentZoom = o.tempZoom || 1;
      o.currentZoomOrigin = o.tempZoomOrigin || { x: 0, y: 0 };

      startDragPos.x = e.clientX || e.touches[0].clientX;
      startDragPos.y = e.clientY || e.touches[0].clientY;
      o.brochureHolder.className += " dragging";

      o.brochureHolder.addEventListener("touchmove", dragMove);
      o.brochureHolder.addEventListener("touchend", stopDrag);
      o.brochureHolder.addEventListener("mousemove", dragMove);
      o.brochureHolder.addEventListener("mouseup", stopDrag);
      o.brochureHolder.addEventListener("mouseleave", stopDrag);
    }

    function stopDrag(e) {
      startDragPos.x = startDragPos.y = 0;
      // console.log("stopDrag");
      o.brochureHolder.removeEventListener("touchmove", dragMove);
      o.brochureHolder.removeEventListener("touchend", stopDrag);
      o.brochureHolder.removeEventListener("mousemove", dragMove);
      o.brochureHolder.removeEventListener("mouseup", stopDrag);
      o.brochureHolder.removeEventListener("mouseleave", stopDrag);

      o.brochureHolder.classList.remove("dragging");

      if (!o.zoomedIn) {
        if (dragOffset.x <= -0.3) {
          o.goToSlide("next",e);
        } else if (dragOffset.x >= 0.3) {
          o.goToSlide("prev",e);
        } else {
          o.goToSlide(o.currentSlide);
        }
      }

      setTimeout(function() {
        o.dragging = false;
      }, 50);
    };

    function dragMove(e) {
      var clientX = e.clientX || e.touches[0].clientX;
      var clientY = e.clientY || e.touches[0].clientY;

      if (o.zoomedIn) {
        var currentScale = o.currentZoom * o.scaleFactor;

        dragOffset.x = (clientX - startDragPos.x) / (o.currentSlideWidth * currentScale - o.brochureWidth);
        dragOffset.y = (clientY - startDragPos.y) / (o.pageHeight * currentScale - o.brochureHeight);

        if (Math.abs(dragOffset.x) > 0.05 || Math.abs(dragOffset.y) > 0.05) {
          o.dragging = true;
        }

        var zoomOrigin = {
          x: Math.min(Math.max(o.currentZoomOrigin.x - dragOffset.x, -0.5), 0.5),
          y: Math.min(Math.max(o.currentZoomOrigin.y - dragOffset.y, -0.5), 0.5)
        };

        o.zoom(o.currentZoom, zoomOrigin); // use zoom function for repos via zoomOrigin
      } else {
        dragOffset.x = (clientX - startDragPos.x) / o.brochureWidth;
        dragOffset.y = (clientY - startDragPos.y) / o.brochureHeight;

        if (Math.abs(dragOffset.x) > 0.05 || Math.abs(dragOffset.y) > 0.05) {
          o.dragging = true;
        }

        for (var i = 0; i < o.pages.length; i++) {
          o.pages[i].style.left = -o.currentSlide * 100 + dragOffset.x * 100 + "%";
        }
      }
    }
  };
  o.cssToHeader = function(){
    console.log(o.brochureVars.zoom);
    (document.getElementById("brochureCSS")) && document.querySelector("head").removeChild(document.getElementById("brochureCSS"));
    
    var css =
    ".brochure-container .nozoom{cursor: auto;} .brochure-container{ display : -webkit-flex; display : flex; } .brochure-container img{ touch-action: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-user-drag: none; -khtml-user-drag: none; -moz-user-drag: none; -o-user-drag: none; user-drag: none;} .dragging .brochure-page{ transition: all 0s; cursor: grab ; } .brochure-page{ position:relative; flex: 1 0 auto; -webkit-flex: 1 0 auto; left:0px; top:50%; transition: left 0.5s ease 0s, transform 0.1s; cursor:"+((o.brochureVars.zoom)?'zoom-in':'grab')+"} .zoomedIn .brochure-page{ cursor: zoom-out; } .zoomedIn.dragging .brochure-page{ cursor: grab ; } .brochure-page.left{ transform-origin : right center;} .brochure-page.right{ transform-origin : left center;} .brochure-page.center{ transform-origin : center center; } ";
    var newStyle = document.createElement("style");
    newStyle.id = "brochureCSS";
    newStyle.innerHTML = css;
    document.querySelector("head").appendChild(newStyle);
  }
  o.init = (function() {
    o.brochureHolder.className = "brochure-container";
    o.pageRatio = o.brochureVars.doublePage ? (o.pageWidth * 2) / o.pageHeight : o.pageWidth / o.pageHeight;
    o.pages = o.brochureHolder.children;
    o.slides = [];

    //

    if (o.brochureVars.doublePage) {
      if (o.brochureVars.doublePageCover) {
        o.brochureLength = Math.ceil(o.pages.length / 2);
      } else {
        o.brochureLength = Math.floor(o.pages.length / 2) + 1;
      }
    } else {
      o.brochureLength = o.pages.length;
    }

    o.cssToHeader();
    o.pageSetup();

    window.addEventListener("resize", o.resize);

    o.broschureNavigation();

    o.resize();
  })();
};

