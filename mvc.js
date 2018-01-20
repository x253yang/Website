/* Some of this code is from class example 22.2: */
var apiKey = 'a491b5c26c972cf297306d11368a1103';
var key = "CS";

(function(exports) {

    var ListModel = function() {
        this._pairs = [];

        // Add a key/value pair or reject and return an error message
        this.addPair = function(key, value) {
            if (typeof key === 'undefined' || typeof value === 'undefined') {
                return "Input is undefined.";
            //} else if (key.length >= value.length) {
            //    return "Length of key must be less than length of value.";
            } else { 
                this._pairs.push([key, value[1]]);
                this.notify([key, value[1]]);
                return null;             
            }
        }

        this.getPairs = function() {
            return this._pairs;
        }

        this.deleteItem = function(idx) {
            this._pairs.splice(idx, 1);
            this.notify();
        }
    }

    // Add observer functionality to ListModel objects
    _.assignIn(ListModel.prototype, {
        // Add an observer to the list
        addObserver: function(observer) {
            if (_.isUndefined(this._observers)) {
                this._observers = [];
            }
            this._observers.push(observer);
            observer(this, null);
        },

        // Notify all the observers on the list
        notify: function(args) {
            if (_.isUndefined(this._observers)) {
                this._observers = [];
            }
            _.forEach(this._observers, function(obs) {
                obs(this, args);
            });
        }
    });


    /*
     * A view of the list of pairs model.  
     * model:  the model we're observing
     * div:  the HTML div where the list goes
     */
    var ListView = function(model, div) {
        var that = this;
        this.updateView = function(obs, args) {
            var pairs = model.getPairs();

            // Display each pair
            var myDiv = $(div + " .list");
            myDiv.empty();
            _.forEach(pairs, function(pair, idx){
                // Get the template.  It isn't parsed, so can't be 
                // manipulated until after it's been added to the DOM.
                var t = $("template#list_item");
                // turn the html from the template into a DOM element
                var elem = $(t.html());

                elem.find(".key").html(pair[0]);
                elem.find(".display").html(pair[1]);
                elem.find(".btn").click(that.makeDeleteItemController(idx));
                myDiv.append(elem);
            });
            that.appendInputRow();
            document.getElementById("menu").value = key;
        };

        this.makeDeleteItemController = function(idx) {
            return function() {
                model.deleteItem(idx);
            }
        };

        // Append a blank input row to the div
        this.appendInputRow = function() {
            var template = $("template#list_input").html();
            $(div + " .list").append(template);
            var row = $(div).find(".input_row");
            row.find(".key").focus();

            // What to do when the add button is clicked.
            // That is, a controller.
            row.find("#addItemBtn").click(function() {
                console.log("click! in " + div);
                //var key = row.find(".key").val();
                var value = row.find(".value").val();
                var err = null;
                if(!value)
                {
                    $.getJSON("https://api.uwaterloo.ca/v2/courses/"+key+".json?key=" + apiKey,
                        function (d) {
                            var info = "<pre>" + JSON.stringify(d, null, 3) + "</pre>";
                            var lines = info.split("\n");
                            
                            var value = "";
                            var res = ["",""];
                            for(var i = 0; i < lines.length; i = i+1)
                            {
                                var index0 = lines[i].indexOf("\"catalog_number\":");
                                var index1 = lines[i].indexOf("\"title\":");
                                if(index0 != -1)
                                {
                                    value = lines[i].substring(index0+19, lines[i].length-2);
                                    if(parseInt(value)>=500)
                                        break;
                                }
                                if(index1 != -1)
                                    res[1] = lines[i].substring(index1+10, lines[i].length-2);
                                if(value != "" && res[1] != "")
                                {
                                    err = model.addPair(key+value, res);
                                    value = "";
                                    res[1] = "";
                                }
                            }
                        });
                    row.find(".key").focus();
                    return;
                }
                var info;
                var res = ["",""];
                
                $.getJSON("https://api.uwaterloo.ca/v2/courses/"+key+"/"+value+".json?key=" + apiKey,
                    function (d) {
                        //$("#out").append("<p>Web service returned at " + time() + "</p>");
                        //$("#out").append("<pre>" + JSON.stringify(d, null, 3) + "</pre>");
                        info = "<pre>" + JSON.stringify(d, null, 3) + "</pre>";

                        var lines = info.split("\n");
                        
                        for(var i = 0; i < lines.length; i = i+1)
                        {
                            var index0 = lines[i].indexOf("\"message\":");
                            var index1 = lines[i].indexOf("\"title\":");
                            if(index0 != -1)
                            {
                                res[0] = lines[i].substring(index0+12, lines[i].length-2);
                            }
                            else if(index1 != -1)
                                res[1] = lines[i].substring(index1+10, lines[i].length-2);
                        }
                        if(res[0] !== "Request successful")
                        {
                            row.find(".error").html("No such course exists!").show();
                            return;
                        }
                          
                        err = model.addPair(key+value, res);
                    });
                
                if (err !== null) {
                    row.find(".error").html(err).show();

                } else {
                    row.find(".error").hide();
                }
                row.find(".key").focus();
            });
        };

        model.addObserver(this.updateView);
    }

    var SummaryView = function(model, div) {
        this.updateView = function(obs, args) {
            $(div + " span").html(model.getPairs().length);
        };

        model.addObserver(this.updateView);
    }

    var DebugView = function(model, div) {
        model.addObserver(function(obs, args) {
            console.log("DebugNotify: args=" + args + "; list=" + model.getPairs());
        });
    }

    exports.doit = function() {
        var model1 = new ListModel();
        var inputView = new ListView(model1, "div#lv1");
        var summaryView = new SummaryView(model1, "div#sv1");
        var debugView = new DebugView(model1, null);
    }
})(window);

function updatekey(x){
    key = x;
}
