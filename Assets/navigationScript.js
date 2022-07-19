var mainPageButton = $("#mainPageButton");
var searchRecipesButton = $("#searchRecipesButton");
var createRecipesButton = $("#createRecipeButton");

function NavigateToMainPage()
{
    window.location = "../RecipePriceChecker/index.html";
}

function NavigateToSearchRecipesPage()
{
    window.location = "../RecipePriceChecker/searchRecipesPage.html";
}

function NavigateToCreateRecipesPage()
{
    window.location = "../RecipePriceChecker/createRecipePage.html";
}

$("#mainPageButton").click(NavigateToMainPage);
$("#searchRecipesButton").click(NavigateToSearchRecipesPage);
$("#createRecipeButton").click(NavigateToCreateRecipesPage);