var CheckBtn = $('#CheckBtn')
var RecipeBtn = $('#ReceipeBtn')
var SaveBtn = $('#SaveBtn')


CheckBtn.on('click', CheckPrice)

RecipeBtn.on('click', CheckRecipe)

SaveBtn.on('click', SavedRecipe)

function hide(){
    $('#title').addClass('hide')
     CheckBtn.addClass('hide')
     RecipeBtn.addClass('hide')
     SaveBtn.addClass('hide')
}

function CheckPrice(){
    // hide first page contents
   hide()
    
    // Alex's function here

}

function CheckRecipe(){
  // hide first page contents
  hide()
    
  // Alex's function here

}


function SavedRecipe(){
    // hide first page contents
    hide()
    // Alex's function here

}

$(function () {
    var  fruitAndVegNames = [
      'apple',
      'apricot',
      'avocado',
      'banana',
      'blackberry',
      'blueberry',
      'cherries',
      'coconut',
      'cranberry',
      'durian',
      'fig',
      'grapefruit',
      'grape',
      'guava', 
      'jackfruit',
      'kiwi',
      'lemon', 
      'lime', 
      'mango',
      'melon',
      'nectarine',
      'olive',
      'orange',
      'papaya',
      'peach',
      'pear',
      'pineapple',
      'plum',
      'pomegranate',
      'pumpkin',
      'raspberry',
      'strawberry',
      'watermelon',

      'asparagu', 
      'garlic', 
      'green bean',
      'beet', 
      'bell pepper', 
      'broccoli',
      'brussel sprout', 
      'cabbage', 
      'capsicum', 
      'carrot', 
      'cauliflower',
      'celery',
      'corn', 
      'cucumber', 
      'kale', 
      'lettuce', 
      'mushroom', 
      'onion', 
      'parsnip',
      'pea', 
      'potato', 
      'snow pea',
      'spinach',
      'squash', 
      'butternut',
      'sweet potato',
      'tomato',
      'zucchini'
    ];
    $('#searchBox').autocomplete({
      source: fruitAndVegNames,
    });
  });

 