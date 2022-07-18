var mainPageButton = $("#mainPageButton");
var onlineRecipesButton = $("#onlineRecipesButton");
var createRecipesButton = $("#createRecipeButton");
var loadRecipesButton = $("#loadRecipeButton");

function NavigateToMainPage()
{
    window.location = "../RecipePriceChecker/index.html";
}

function NavigateToOnlineRecipesPage()
{
    window.location = "../RecipePriceChecker/searchRecipesPage.html";
}

function NavigateToCreateRecipesPage()
{
    window.location = "../RecipePriceChecker/createRecipePage.html";
}

function NavigateToLoadRecipesPage()
{
    window.location = "../RecipePriceChecker/loadRecipePage.html";
}

$("#mainPageButton").click(NavigateToMainPage);
$("#onlineRecipesButton").click(NavigateToOnlineRecipesPage);
$("#createRecipeButton").click(NavigateToCreateRecipesPage);
$("#loadRecipeButton").click(NavigateToLoadRecipesPage);