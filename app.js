// BUDGER CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) { // function constructor
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [], // we will have an array of objects for expenses and income items
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) { // cur = current element in the array :)
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) { //this function is made public 
            var newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // create new item 
            if (type === 'exp') {
                newItem = new Expense(ID, des, val); // creates new instance of expense constructor incl prototype
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push it into our data structure
            data.allItems[type].push(newItem); // pushes this instance to expenses or income array
            //return the new element
            return newItem;
        },

        deleteItem: function(type, ID) {
            var ids, index;
            //ids = [1,2,4,6,8]
            ids = data.allItems[type].map(function(current) { //current means current value, which is an object
                return current.id; // this returns the id value of the object
            });

            index = ids.indexOf(ID); // this will return the position in our array that the id is in; -1 indicates the 
            //item is not found in the array
            if (index !== -1) { //the id is actually in the array
                data.allItems[type].splice(index, 1); // first argument is where you want to start splicing and secoond is
                //how many elements you want to delete
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            // calculate the budget (inc - exp)
            data.budget = data.totals.inc - data.totals.exp; // all these variables are in our module, so we have access to them :D
            // calculate the percentage of income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc); // calculate the percentage for all items in the array
            })
        },

        getPercentages: function() { // returns an array of all percentages for the items in the expense array
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            })
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    }

})();

//UI CONTROLLER
var UIController = (function() {
    var DOMStrings = {
        inputType: '.add__type',
        descriptionType: '.add__description',
        valueType: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, sign;
        num = Math.abs(num); // toFixed is a method for Math
        num = num.toFixed(2); // toFixed is a method of number prototype, but this returns a string! 
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3); // '
        }
        dec = numSplit[1];;

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i< list.length; i++) { // we are just calling the callback fxn on every element in the list
            callback(list[i], i); //current and index
        }
    };

    return { // we are returning an object
        getInput: function() { // this is a method in our returned object
            return {
            type: document.querySelector(DOMStrings.inputType).value, // will be either inc or expense
            description: document.querySelector(DOMStrings.descriptionType).value,
            value: parseFloat(document.querySelector(DOMStrings.valueType).value)
            }
        },
        addListItem: function(obj, type) {
            var html, newHTML, element;

            //create html string w/ placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
        
            //replace placeholder text with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            //insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.descriptionType + ',' + DOMStrings.valueType);

            fieldsArr = Array.prototype.slice.call(fields); // returns an array
            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) { // another public method
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, type);
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, type);

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel); // returns a node list

            nodeListForEach(fields, function(current, index) { // we are passing a callback function into it
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%'; //fields[i].textContent = percentages[i];
                } else {
                    current.textContent = '---';
                };
            })
        },

        displayMonth: function() {
            var now, months, month, year;
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() { // when the event is changed, we call this function to change the colour
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + DOMStrings.descriptionType + ',' + DOMStrings.valueType);

            nodeListForEach(fields, function(cur) { 
                cur.classList.toggle('red-focus'); // .add__type.classList.toggle
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function() {
            return DOMStrings; //making this public
        }

}

})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
                if (event.keyCode === 13 || event.which === 13) {
                    ctrlAddItem(); // call this function if the user hits enter
                }
            });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); //the callback function ctrlDeleteItem
        //always has access to the event object
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update the UI w/ the new percentages
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the filed input data
        input = UICtrl.getInput(); // get the input from UI module

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) { 

        // 2. add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // 3. add the item to the user interface
        UICtrl.addListItem(newItem, input.type);
        //4. clear the field
        UICtrl.clearFields();
        // 5. calculate and update budget
        updateBudget();
        // 6. calculate and update the percentages
        updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // returns 'income-0' for ex; this is the only
        //place where we use id's 
        if (itemID) {
            splitID = itemID.split('-'); // returns ["inc", "1"]
            type = splitID[0];
            ID = parseInt(splitID[1]); 

            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID); // type = 'inc' or 'exp' 
            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID); // we are passing something like 'income-1'
            // 3. update and showw the new budget
            updateBudget();
            // 4. calculate and update the percentages
            updatePercentages();
        }
    }

    return {
        init: function() {
            console.log('Application has started.');    
            UICtrl.displayMonth();  
            UICtrl.displayBudget( {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });  // don't send the budget object, but one where everything's set to 0
            setupEventListeners();

        }
    }

})(budgetController, UIController);

controller.init();