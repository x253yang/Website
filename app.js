/*
 *  Starter code for University of Waterloo CS349 - Spring 2017 - A3.
 *	Refer to the JS examples shown in lecture for further reference.
 *  Note: this code uses ECMAScript 6.
 *  Updated 2017-07-12.
 */

"use strict";

// Get your own API key from https://uwaterloo.ca/api/register
var apiKey = 'ce727aeab6e61fa44e8b2ccc6c4b54f5';

(function (exports) {

    /* A Model class */
    class AppModel {
        constructor() {
            this._observers = [];
            this.pairs = [];
        }

        // You can add attributes / functions here to store the data


        // Call this function to retrieve data from a UW API endpoint
        loadData(endpointUrl,date,location,keyword,diet) {
            var that = this;
            $.getJSON(endpointUrl + "?key=" + apiKey,
                function (data) {
                    // Do something with the data; probably store it
                    // in the Model to be later read by the View.
                    // Use that (instead of this) to refer to the instance 
                    // of AppModel inside this function.

                    that.pairs = [];
                    var out = data.data.outlets;
                    for (var i = 0; i < out.length; i++) {
                        if (location == "" || out[i].outlet_name == location) {
                            for (var j = 0; j < out[i].menu.length; j++) {
                                if (out[i].menu[j].date == date) {
                                    for(var k = 0; k < out[i].menu[j].meals.lunch.length; k++) {
                                        var dish = out[i].menu[j].meals.lunch[k];
                                        if ((diet == "None" || dish.diet_type == diet) &&
                                        (keyword == "" || keyword.toLowerCase() == "lunch" ||
                                        dish.product_name.toLowerCase().includes(keyword.toLowerCase()))) {
                                                that.pairs.push([out[i].outlet_name + " Lunch", dish.product_name]);
                                        }
                                    }

                                    for(var k = 0; k < out[i].menu[j].meals.dinner.length; k++) {
                                        var dish = out[i].menu[j].meals.dinner[k];
                                        if ((diet == "None" || dish.diet_type == diet) &&
                                            (keyword == "" || keyword.toLowerCase() == "dinner" ||
                                            dish.product_name.toLowerCase().includes(keyword.toLowerCase()))) {
                                                that.pairs.push([out[i].outlet_name + " Dinner", dish.product_name]);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    that.notify(); // Notify View(s)
                }
            );
        }

        getPairs() {
            return this.pairs;
        }


        // Add observer functionality to AppModel objects:

        // Add an observer to the list
        addObserver(observer) {
            this._observers.push(observer);
            observer.updateView(this, null);
        }

        // Notify all the observers on the list
        notify(args) {
            _.forEach(this._observers, function (obs) {
                obs.updateView(this, args);
            });
        }
    }

    /*
     * A view class.
     * model:  the model we're observing
     * div:  the HTML div where the content goes
     */
    class AppView {
        constructor(model, div) {
            this.model = model;
            this.div = div;
            model.addObserver(this); // Add this View as an Observer
        }

        updateView(obs, args) {

            // Add code here to update the View
            var pairs = this.model.getPairs();

            // Display each pair
            var myDiv = $(this.div + " .list");
            myDiv.empty();
            _.forEach(pairs, function(pair, idx){
                // Get the template.  It isn't parsed, so can't be
                // manipulated until after it's been added to the DOM.
                var t = $("template#list_item");
                // turn the html from the template into a DOM element
                var elem = $(t.html());

                elem.find(".key2").html(pair[0]);
                elem.find(".value2").html(pair[1]);
                myDiv.append(elem);
            });
        };
    }

    /*
     * A controller class
     * model:  the model
     * div:  the HTML div where the content goes
     */
    class AppControl {
        constructor(model, div) {
            this.model = model;
            this.div = div;
            var that = this;

            // An event handler for what to do when the search button is clicked.
            document.getElementById("searchBtn").onclick = function () {
                var date = document.getElementById("date").value;
                var week = that.weekNum(new Date(date));
                var store = document.getElementById("location").value;
                var keyword = document.getElementById("keyword").value;
                var diet = document.getElementById("diet").value;
                model.loadData("https://api.uwaterloo.ca/v2/foodservices/2017/" + week + "/menu.json",
                    date,store,keyword,diet);
            }
        }

        weekNum(date) {
            var jan1 = new Date(date.getFullYear(), 0, 2);
            return Math.ceil((((date - jan1) / 86400000) + jan1.getDay() + 1) / 7);
        }


    }


    /*
     Function that will be called to start the app.
     Complete it with any additional initialization.
     */
    exports.startApp = function () {
        var model1 = new AppModel();
        var view1 = new AppView(model1, "div#view1");
        var control1 = new AppControl(model1, "div#control1");

        /*
         if (apiKey === '') {
         document.write("You need an API key.");
         }
         $("div#view1").append("<p>Ready to call the web service</p>");


         $.getJSON("https://api.uwaterloo.ca/v2/foodservices/2017/10/menu.json?key=" + apiKey,
         function (d) {
         $("div#view1").append("<p>Web service returned</p>");
         $("div#view1").append("<pre>" + JSON.stringify(d, null, 3) + "</pre>");
         });


         $("div#view1").append("<p>After calling the web service</p>");
         */
    }
})(window);
