var recipeInformationListElement = $("#recipeCategories");
var recipeInCategoryListElement = $("#recipesInCategory");
var savedRecipesListElement = $("#savedRecipesList");

var userRecipes = [];

function Init()
{
    LoadUserRecipes();
    DisplayUserRecipes();
    DisplayOnlineCategories();
}

function ShowCategoriesButtonPressed()
{
    let apiUrl = GetAPIUrl("listCategories", "");
    QueryAPI("listCategories", apiUrl);
}

function GetAPIUrl(apiRequestType, seachTerm)
{
    //let apiUrl;

    if (apiRequestType === "listCategories") return "https://www.themealdb.com/api/json/v1/1/list.php?c=list";
    else if (apiRequestType === "searchByCategory") return "https://www.themealdb.com/api/json/v1/1/filter.php?c=" + seachTerm;
    else if (apiRequestType === "searchByRecipeID") return "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + seachTerm;

    //QueryAPI(apiRequestType, apiUrl);
}

function QueryAPI(apiRequestType, apiUrl)
{
    fetch(apiUrl).then(function (response) 
    {
        if (response.ok)
        {
            response.json().then(function (data) 
            {
                console.log(data);

                if (apiRequestType === "listCategories") ListCategories(data);
                else if (apiRequestType === "searchByCategory") ListRecipesInCategory(data);
                else if (apiRequestType === "searchByRecipeID") DisplayRecipe(data);
            });
        }
    });
}

function ListCategories(data)
{
    for (let i = 0; i < data.meals.length; i++)
    {
        let newCategoryElement = $("<div data-category='" + data.meals[i].strCategory + "' class='categoryButton'>" + data.meals[i].strCategory + "</div>");
        $(newCategoryElement).click(SearchByCategoryButtonPressed);
        newCategoryElement.appendTo(recipeInformationListElement);
    }
}

function ListRecipesInCategory(data)
{
    recipeInCategoryListElement.empty();
    for (let i = 0; i < data.meals.length; i++)
    {
        let newMealElement = $("<div data-recipeid='" + data.meals[i].idMeal + "' class='categoryButton'>" + data.meals[i].strMeal + "</div>");
        let newMealElementImage = $("<image data-recipeid='" + data.meals[i].idMeal + "' class='previewImageWithLink' src='" + data.meals[i].strMealThumb + "' alt='Recipe preview image'>");

        $(newMealElement).click(GoToOnlineRecipe);
        $(newMealElementImage).click(GoToOnlineRecipe);

        newMealElement.appendTo(recipeInCategoryListElement);
        newMealElementImage.appendTo(recipeInCategoryListElement);
    }
}

function DisplayRecipe(data)
{
    let newRecipeNameElement = $("<div>" + data.meals[0].strMeal + "</div>");
    let newRecipeElementImage = $("<image class='previewImage' src='" + data.meals[0].strMealThumb + "' alt='Recipe preview image'>");

    newRecipeNameElement.appendTo(recipeInformationListElement);
    newRecipeElementImage.appendTo(recipeInformationListElement);

    let ingredients = PullIngredientsIntoArray(data);

    for (let i = 0; i < ingredients.length; i++) 
    {
        let newIngredientElement = $("<div>" + ingredients[i].ingredientQuantity + " " + ingredients[i].ingredientName + "</div>");
        newIngredientElement.appendTo(recipeInformationListElement);
    }

    let newRecipeInstructionsElement = $("<div>" + data.meals[0].strInstructions + "</div>");
    newRecipeInstructionsElement.appendTo(recipeInformationListElement);
}

class Ingredient
{
    constructor(ingredientName, ingredientQuantity)
    {
        this.ingredientName = ingredientName;
        this.ingredientQuantity = ingredientQuantity;
    }
}

function PullIngredientsIntoArray(data)
{
    let ingredientArray = [];
    for (let i = 1; i <= 20; i++) 
    {
        let ingredient = "strIngredient" + i;
        let measurement = "strMeasure" + i;

        if (data.meals[0][ingredient] != "" && data.meals[0][ingredient] != null && data.meals[0][measurement] != "" && data.meals[0][measurement] != null) 
        {
            ingredientArray.push(new Ingredient(data.meals[0][ingredient], data.meals[0][measurement]));
        }
    }
    console.log(ingredientArray);
    return ingredientArray;
}

function SearchByCategoryButtonPressed(event)
{
    let buttonCategory = $(event.target).data("category");
    let apiUrl = GetAPIUrl("searchByCategory", buttonCategory);
    QueryAPI("searchByCategory", apiUrl);
}

function SearchByRecipeIDButtonPressed(event)
{
    let recipeID = $(event.target).data("recipeid");
    let apiUrl = GetAPIUrl("searchByRecipeID", recipeID);
    QueryAPI("searchByRecipeID", apiUrl);
}

function LoadUserRecipes()
{
    let savedRecipes = JSON.parse(localStorage.getItem("RecipePriceCheckerRecipes"));
    userRecipes = savedRecipes;
}

function DisplayUserRecipes()
{
    for (let i = 0; i < userRecipes.length; i++) 
    {
        let newUserRecipeDisplay = $("<li class='categoryButton' data-recipename=" + userRecipes[i].searchName + ">" + userRecipes[i].name + "</li>");
        newUserRecipeDisplay.appendTo(savedRecipesListElement);
        newUserRecipeDisplay.click(GoToUserRecipe);
    }
}

function GoToUserRecipe(event)
{
    localStorage.setItem("RecipePriceCheckerPageToLoad", JSON.stringify($(event.target).data("recipename")));
    window.location = "../RecipePriceChecker/createRecipePage.html";
}

function DisplayOnlineCategories()
{
    let apiUrl = GetAPIUrl("listCategories", "");
    QueryAPI("listCategories", apiUrl);
}

function GoToOnlineRecipe(event)
{
    let recipeID = $(event.target).data("recipeid");
    let recipeApiUrl = GetAPIUrl("searchByRecipeID", recipeID);
    localStorage.setItem("RecipePriceCheckerOnlineRecipeToLoad", JSON.stringify(recipeApiUrl));
    window.location = "../RecipePriceChecker/createRecipePage.html";
}

Init();

$("#showCategoriesButton").click(ShowCategoriesButtonPressed);