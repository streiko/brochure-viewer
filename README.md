# brochureViewer
little Framework for displaying content in a single- or double paged slider


<div id="brochure">
  <div id="page1"></div>
  <div id="page2"></div>
  <div id="page3"></div>
  <div id="page4"></div>
  <div id="page5"></div>
  <div id="page6"></div>
  <div id="page7"></div>
  <div id="page8"></div>
  <div id="page9"></div>
 </div>



var mybrochure = new BrochureWidget({
 brochureHolder: document.getElementById("brochure"),
 pageWidth: 400,
 pageHeight: 600,
 doublePage: true,
 doublePageCover: false,
 zoom: true
});
