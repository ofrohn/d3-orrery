/* global dateDiff, px, has, findPos, isNumber */
var datetimepicker = function(options) {
  //options: id:string, target:string, format:string (d3.time.format), time:bool,  timezone:bool, weekdays: bool, dateselect: bool, startofweek: bool, vanishonpick: bool, position:[left, top], callback: function
  
  var cfg = options || {},
      date = new Date(), 
      timezone = date.getTimezoneOffset(),
      tzFormat = d3.time.format("%Z"),
      tz = [{"−12:00":720}, {"−11:00":660}, {"−10:00":600}, {"−09:30":570}, {"−09:00":540}, {"−08:00":480}, {"−07:00":420}, {"−06:00":360}, {"−05:00":300}, {"−04:30":270}, {"−04:00":240}, {"−03:30":210}, {"−03:00":180}, {"−02:00":120}, {"−01:00":60}, {"±00:00":0}, {"+01:00":-60}, {"+02:00":-120}, {"+03:00":-180}, {"+03:30":-210}, {"+04:00":-240}, {"+04:30":-270}, {"+05:00":-300}, {"+05:30":-330}, {"+05:45":-345}, {"+06:00":-360}, {"+06:30":-390}, {"+07:00":-420}, {"+08:00":-480}, {"+08:30":-510}, {"+08:45":-525}, {"+09:00":-540}, {"+09:30":-570}, {"+10:00":-600}, {"+10:30":-630}, {"+11:00":-660}, {"+12:00":-720}, {"+12:45":-765}, {"+13:00":-780}, {"+14:00":-840}],
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      days = ["Su", "M", "Tu", "W", "Th", "F", "Sa"],
      dateFormat,
      years = getYears(date),
      target = cfg.target || "", 
      id = cfg.id || "datetimepicker", 
      showtime = has(cfg, "time") ? cfg.time : true,
      showtimezone = has(cfg, "timezone") ? cfg.timezone : true,
      showweekdays = has(cfg, "weekdays") ? cfg.weekdays : true,
      showdateselect = has(cfg, "dateselect") ? cfg.dateselect : true,
      startofweek = has(cfg, "startofweek") ? cfg.startofweek : 0,
      //pick -> vanish
      vanishonpick = has(cfg, "vanishonpick") ? cfg.vanishobpick : true,
      callbackfunc = cfg.callback || null,
      //position top/bottom  , left/right
      position = cfg.position || ["left", "top"];

  if (cfg.format) dateFormat = d3.time.format(cfg.format);
  else dateFormat = d3.time.format("%Y-%m-%d");
      
  function dtpicker(dt) {
    var node = picker.node(),
        tnode = d3.select(target).node(),
        pos = getPosition(node, tnode);
     
    if (node.offsetTop === -9999) {
      date.setTime(dt.valueOf());
      set();
      picker.style({"top": px(pos[1]), "left": px(pos[0]), "opacity": 1});  
      d3.select(tnode).classed("active", true);
    } else {
      vanish();
    }    
  }  
    
  //var frag = document.createDocumentFragment();
  var picker = d3.select("body").append("div").attr("id", id);
  monthArrow("left");
  monthSelect();
  yearSelect();
  monthArrow("right");
  daySelect();
  timeSelect();  
  
  function getPosition(node, trgt) {
    var p = findPos(trgt);
    var left = position[0] === "left" ? p.l : p.l + p.w - node.offsetWidth;
    var top = position[1] === "top" ? p.t - node.offsetHeight - 1 : p.t + p.h - 1;

    return [left, top];
  }
  
  function daySelect() {
    var i, cal = d3.select("#cal"),
        mo = d3.select("#mon").node().value, yr = d3.select("#yr").node().value,
        today = new Date(),
        sow = startofweek;
        
    if (!cal.node()) cal = picker.append("div").attr("id", "cal");
    yr = parseInt(yr); 
    if (!isNumber(mo)) mo = findMonth(mo);
    else mo = parseInt(mo);
    var curdt = new Date(yr, mo, 1);
    
    curdt.setDate(curdt.getDate() - curdt.getDay() + sow);
    var nd = cal.node();
    while (nd.firstChild) nd.removeChild(nd.firstChild);
    
    if (showweekdays === true) {
      for (i = sow; i < sow + 7; i++) {
        var day = i > 6 ? i - 7 : i;
        cal.append("div").classed({"date": true, "weekday": true}).html(days[day]);
      }
    }
    for (i=0; i<42; i++) {
      var curmon = curdt.getMonth(), curday = curdt.getDay(), curid = dateFormat(curdt);
      cal.append("div").classed({
        "date": true, 
        "grey": curmon !== mo,
        "weekend": curmon === mo && (curday === 0 || curday === 6),
        "today": dateDiff(curdt, today, "d") === 0,
        "selected": dateDiff(curdt, date, "d") === 0
      }).attr("id", curid)
      .on("click", pick)
      .html(curdt.getDate().toString());
      
      curdt.setDate(curdt.getDate() + 1);
    }
  }

  function yearSelect() { 
    var year = date.getFullYear();

    if (showdateselect === true) {
      var sel = picker.append("select").attr("title", "Year").attr("id", "yr").on("change", daySelect).on("keyup", daySelect),
          selected = 0;
          
      sel.selectAll('option').data(years).enter().append('option')
         .text(function (d, i) { 
           if (d === year) selected = i; 
           return d.toString(); 
         });
      sel.property("selectedIndex", selected);
    } else
      picker.append("input").attr("type", "text").attr("title", "Year").attr("id", "yr").attr("readonly", "readonly").attr("value", year);
  }
  
  function monthSelect() { 
    var month = date.getMonth();
    if (showdateselect === true) {
      var sel = picker.append("select").attr("title", "Month").attr("id", "mon").on("change", daySelect).on("keyup", daySelect),
          selected = 0;
      
      sel.selectAll('option').data(months).enter().append('option')
         .attr("value", function (d, i) { 
           if (i === month) selected = i; 
           return i; 
         })
         .text(function (d) { return d; });
      sel.property("selectedIndex", selected);
    } else
      picker.append("input").attr("type", "text").attr("title", "Month").attr("id", "mon").attr("readonly", "readonly").attr("value", months[month]);
  }
  
  function monthArrow(dir) {
    var lnk = picker.append("div").attr("id", dir).on("click", function() {
      var mon = d3.select("#mon").node(), yr = d3.select("#yr").node();
      
      if (mon.tagName.toLowerCase() === "select") {
        if (dir === "left") {
          if (mon.selectedIndex === 0) {
            mon.selectedIndex = 11; yr.selectedIndex--;
          } else mon.selectedIndex--;
        } else {
          if (mon.selectedIndex === 11) {
            mon.selectedIndex = 0; yr.selectedIndex++;
          } else mon.selectedIndex++;
        }
      } else {
        var month = findMonth(mon.value), year = parseInt(yr.value);
        if (dir === "left") {
          if (month === 0) { month = 11; year--; }
          else month--;
        } else {
          if (month === 11) { month = 0; year++; }
          else month++;
        }
        mon.value = months[month];
        yr.value = year;
      }
      daySelect();
    });
  }

  function timeSelect() { 
    if (showtime === false) return;
    picker.append("input").attr("type", "number").attr("id", "hr").attr("title", "Hours").attr("max", "24").attr("min", "-1").attr("step", "1").attr("value", date.getHours()).on("change", function() { if (testNumber(this) === true) pick(); });

    picker.append("input").attr("type", "number").attr("id", "min").attr("title", "Minutes").attr("max", "60").attr("min", "-1").attr("step", "1").attr("value", date.getMinutes()).on("change", function() { if (testNumber(this) === true) pick(); });
    
    picker.append("input").attr("type", "number").attr("id", "sec").attr("title", "Seconds").attr("max", "60").attr("min", "-1").attr("step", "1").attr("value", date.getSeconds()).on("change", function() { if (testNumber(this) === true) pick(); });
    if (showtimezone === true) tzSelect();
  }
  
  function tzSelect() { 
    var sel = picker.append("select").attr("title", "Time zone offset from UTC").attr("id", "tz").on("change", pick),
        selected = 15;
    timezone = date.getTimezoneOffset();
    sel.selectAll('option').data(tz).enter().append('option')
       .attr("value", function (d, i) { 
         var k = Object.keys(d)[0];
         if (d[k] === timezone) selected = i; 
         return d[k]; 
       })
       .text(function (d) { return Object.keys(d)[0]; });
    sel.property("selectedIndex", selected);
  }
  
  function getYears(dt) {
    var y0 = dt.getFullYear(), res = [];
    for (var i=y0-10; i<=y0+10; i++) res.push(i);
    return res;
  }  
  
  function select(id, val) {
    var node = d3.select(id).node();
    
    if (node.tagName.toLowerCase() === "select") {
      for (var i=0; i<node.childNodes.length; i++) {
        if (node.childNodes[i].value == val) {
          node.selectedIndex = i;
          break;
        }
      }
    } else {
      if (node.id === "mon") node.value = months[val];
      else node.value = val;
    }
  }
  
  function set() {    
    select("#yr", date.getFullYear());
    select("#mon", date.getMonth());
    daySelect();
    if (showtime) {
      d3.select("#hr").node().value = date.getHours();
      d3.select("#min").node().value = date.getMinutes();
      d3.select("#sec").node().value = date.getSeconds();
    }
  } 
  
  this.show = function(dt) {
  };
  
  this.isVisible = function() {
    return picker.node().offsetTop !== -9999;
  };

  this.hide = function() {
    vanish();
  };
  
  function vanish() {
    picker.style("opacity", 0);
    d3.select("#error").style( {top:"-9999px", left:"-9999px", opacity:0} ); 
    d3.select(target).classed("active", false);
    setTimeout(function() { picker.style("top", px(-9999)); }, 600);    
  }
  
  function pick() {        
    if (this.id && this.id.search(/^\d/) !== -1) {
      date = dateFormat.parse(this.id); 
    }
    /*
    var yr = date.getFullYear(), mo = date.getMonth();
    select("yr", yr);
    select("mon", mo);
    daySel();*/
    if (showtime === true) {
      var h = d3.select("#hr").node().value, 
          m = d3.select("#min").node().value,
          s = d3.select("#sec").node().value;
      timezone = d3.select("#tz").node().value;
      date.setHours(h, m, s);
    }
    set();
    
    if (callbackfunc) callbackfunc(date, timezone);
    if (vanishonpick === true) vanish();
  } 

  function findMonth(mon) {
    for (var i=0; i<months.length; i++) {
      if (months[i] === mon) return i;
    }
  }
  
  dtpicker.target = function(_) {
    if (!arguments.length) return target; 
    if (_.indexOf("#") !== 0) target = "#" + _;
    else  target = _;
    return dtpicker;
  };
  
  dtpicker.dateFormat = function(_) {
    if (!arguments.length) return dateFormat; 
    dateFormat = d3.time.format(_);
    return dtpicker;
  };
  
  dtpicker.callback = function(_) {
    if (!arguments.length) return callbackfunc; 
    callbackfunc = _;
    return dtpicker;
  };

  dtpicker.date =  function() {
    return dateFormat(date);
  };
  
  return dtpicker;  
};

//Check numeric field
function testNumber(node) {
  var v, adj = node.id === "hr" || node.id === "min" || node.id === "sec" ? 1 : 0;
  if (node.validity) {
    v = node.validity;
    if (v.typeMismatch || v.badInput) { popError(node, node.title + ": check field value"); return false; }
    if (v.rangeOverflow || v.rangeUnderflow) { popError(node, node.title + " must be between " + (parseInt(node.min) + adj) + " and " + (parseInt(node.max) - adj)); return false; }
  } else {
    v = node.value;
    if (!isNumber(v)) { popError(node, node.title + ": check field value"); return false; }
    v = parseFloat(v);
    if (v < node.min || v > node.max ) { popError(node, node.title + " must be between " + (node.min + adj) + " and " + (+node.max - adj)); return false; }
  }
  d3.select("#error").style( {top:"-9999px", left:"-9999px", opacity:0} ); 
  return true; 
}

// Error notification
function popError(nd, err) {
  var p = findPos(nd);
  d3.select("#error").html(err).style( {top:px(p[1] + nd.offsetHeight + 1), left:px(p[0]), opacity:1} );
  nd.focus();
}
