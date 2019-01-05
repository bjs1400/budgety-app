// BUDGER CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value) { // function constructor
        this.id = id;
        this.description = description;
        this.value = value;
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
        percentageLabel: '.budget__expenses--percentage'
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
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
        
            //replace placeholder text with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);
            //insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
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
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }

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
    };

    var updateBudget = function() {
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the filed input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) { 

        // 2. add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // 3. add the item to the user interface
        UICtrl.addListItem(newItem, input.type);
        //4. clear the field
        UICtrl.clearFields();
        // 5. calculate and update budget
        updateBudget();
        }
    };

    return {
        init: function() {
            console.log('Application has started.');      
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