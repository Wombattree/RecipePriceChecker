var recipeInformationListElement = $("#recipeCategories");
var recipeInCategoryListElement = $("#recipesInCategory");
var savedRecipesListElement = $("#savedRecipesList");

const localStorageStringForLoadingUserRecipe = "RecipePriceChecker_LoadUserRecipe";
const localStorageStringForLoadingOnlineRecipe = "RecipePriceChecker_LoadOnlineRecipe";
const localStorageStringForSavingUserRecipes = "RecipePriceChecker_UserRecipes";

var userRecipes = [];

const categoriesPerRow = 6;
const recipesPerRow = 6;

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

function GetAPIUrl(apiRequestType, searchTerm)
{
    if (apiRequestType === "listCategories") return "https://www.themealdb.com/api/json/v1/1/list.php?c=list";
    else if (apiRequestType === "searchByCategory") return "https://www.themealdb.com/api/json/v1/1/filter.php?c=" + searchTerm;
    else if (apiRequestType === "searchByRecipeID") return "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + searchTerm;
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
    let categories = data.meals.length;
    let categoriesCreated = 0;
    let categoryRows = Math.ceil(categories / categoriesPerRow);
    recipeInCategoryListElement.empty();

    for (let i = 0; i < categoryRows; i++) 
    {
        let newRowElement = $("<div class='columns'></div>");

        for (let j = 0; j < categoriesPerRow; j++) 
        {
            if (categoriesCreated < data.meals.length)
            {
                let offset = (j === 0 && i === categoryRows - 1) ? "is-offset-" + (categories - (categoryRows - 1) * categoriesPerRow + 2) : "";
                let newCategoryElement = $("<div data-category='" + data.meals[categoriesCreated].strCategory + "' class='column is-2 " + offset + " standardButton'>" + data.meals[categoriesCreated].strCategory + "</div>");
                $(newCategoryElement).click(SearchByCategoryButtonPressed);
                newCategoryElement.appendTo(newRowElement);
                categoriesCreated++;
            }
        }

        newRowElement.appendTo(recipeInformationListElement);
    }
}

function ListRecipesInCategory(data)
{
    let recipes = data.meals.length;
    let recipesCreated = 0;
    let recipeRows = Math.ceil(recipes / recipesPerRow);
    recipeInCategoryListElement.empty();

    for (let i = 0; i < recipeRows; i++)
    {
        let newRowElement = $("<div class='columns'></div>");

        for (let j = 0; j < recipesPerRow; j++) 
        {
            if (recipesCreated < recipes)
            {
                let newRecipeContainerElement = $("<div data-recipeid='" + data.meals[recipesCreated].idMeal + "' class='column is-2 standardButton'></div>");
                let newMealElement = $("<div data-recipeid='" + data.meals[recipesCreated].idMeal + "'>" + data.meals[recipesCreated].strMeal + "</div>");
                let newMealElementImage = $("<image data-recipeid='" + data.meals[recipesCreated].idMeal + "' class='previewImageWithLink' src='" + data.meals[recipesCreated].strMealThumb + "' alt='Recipe preview image'>");

                newMealElement.appendTo(newRecipeContainerElement);
                newMealElementImage.appendTo(newRecipeContainerElement);
                newRecipeContainerElement.click(GoToOnlineRecipe);
                newRecipeContainerElement.appendTo(newRowElement);
                recipesCreated++;
            }
        }
        newRowElement.appendTo(recipeInCategoryListElement);
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

function LoadUserRecipes()
{
    let savedRecipes = JSON.parse(localStorage.getItem(localStorageStringForSavingUserRecipes));
    if (savedRecipes !== null) userRecipes = savedRecipes;
}

function DisplayUserRecipes()
{
    let recipes = userRecipes.length;
    let recipesCreated = 0;
    let recipeRows = Math.ceil(recipes / recipesPerRow);

    for (let i = 0; i < recipeRows; i++)
    {
        let newRowElement = $("<div class='columns'></div>");

        for (let j = 0; j < recipesPerRow; j++) 
        {
            if (recipesCreated < recipes)
            {
                let newUserRecipeDisplay = $("<li class='column is-2 standardButton' data-recipename=" + userRecipes[recipesCreated].recipeSearchName + ">" + userRecipes[recipesCreated].recipeName + "</li>");
                newUserRecipeDisplay.click(GoToUserRecipe);
                newUserRecipeDisplay.appendTo(newRowElement);
                recipesCreated++;
            }
        }
        newRowElement.appendTo(savedRecipesListElement);
    }
}

function GoToUserRecipe(event)
{
    localStorage.setItem(localStorageStringForLoadingUserRecipe, JSON.stringify($(event.target).data("recipename")));
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
    localStorage.setItem(localStorageStringForLoadingOnlineRecipe, JSON.stringify(recipeApiUrl));
    window.location = "../RecipePriceChecker/createRecipePage.html";
}

Init();

$("#showCategoriesButton").click(ShowCategoriesButtonPressed);