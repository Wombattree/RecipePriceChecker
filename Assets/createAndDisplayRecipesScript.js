var ingredientInformationListElement = $("#ingredientInformation");
var instructionInformationListElement = $("#instructionInformation");

var recipeNameDisplayElement = $("#recipeName");

var approximateCostElement = $("#approximateCost");

var addRecipeInformationContainerElement = $("#addRecipeInformationContainer");
var editRecipeNameContainerElement = $("#editRecipeNameContainer");
var addIngredientContainerElement = $("#addIngredientContainer");
var addInstructionContainerElement = $("#addInstructionContainer");
var displayedOption;

const localStorageStringForLoadingUserRecipe = "RecipePriceChecker_LoadUserRecipe";
const localStorageStringForLoadingOnlineRecipe = "RecipePriceChecker_LoadOnlineRecipe";
const localStorageStringForSavingUserRecipes = "RecipePriceChecker_UserRecipes";
const recipeNameDefault = "Untitled Recipe";
const recipeNameLoading = "Loading Recipe...";

var outstandingFetchRequests = [];
var fruitAndVegWeights = [];
var recipes = [];
var currentRecipe;

//#region -- Class Declarations --
class Recipe
{
    ingredients = [];
    instructions = [];

    estimatedCost = 0;
    image;

    recipeName = "";
    recipeSearchName = "";

    constructor(recipeName, recipeSearchName)
    {
        this.recipeName = recipeName;
        this.recipeSearchName = recipeSearchName;
    }
}

class Ingredient
{
    woolworthsProducts = [];

    constructor(ingredientName, ingredientQuantity, ingredientUnits)
    {
        this.ingredientName = ingredientName;
        this.ingredientQuantity = ingredientQuantity;
        this.ingredientUnits = ingredientUnits;
    }

    AddWoolworthsProductInformation(woolworthsProducts, minPriceIndex, maxPriceIndex, meanPrice)
    {
        this.woolworthsProducts = woolworthsProducts;
        this.minPriceIndex = minPriceIndex;
        this.maxPriceIndex = maxPriceIndex;
        this.meanPrice = meanPrice;
    }
}

class WoolworthsProduct
{
    constructor(name, imageUrl, stockcode, originalWeight, isOriginalWeightEstimated, originalUnits, originalPrice, pricePerGramOrML, normalisedUnit) 
    {
        this.name = name;
        this.imageUrl = imageUrl;
        this.stockcode = stockcode;
        this.originalWeight = originalWeight;
        this.isOriginalWeightEstimated = isOriginalWeightEstimated;
        this.originalUnits = originalUnits;
        this.originalPrice = originalPrice;
        this.pricePerGramOrML = pricePerGramOrML;
        this.normalisedUnit = normalisedUnit;
    }
}

class FruitAndVegetableWeightObject 
{
    constructor(name, estimatedWeight) 
    {
        this.name = name;
        this.estimatedWeight = estimatedWeight;
    }
}
//#endregion

//#region -- Fruit and Vegetables Weight Information --
//Weights sourced from https://weightofstuff.com/average-weight-of-all-fruits-and-vegetables/
function AddFruitAndVegetableWeightsToArray()
{
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("apple", 195));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("apricot", 35));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("avocado", 170));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("banana", 120));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("blackberry", 2.45));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("blueberry", 0.5));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("cherries", 5));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("coconut", 680));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("cranberry", 1.13));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("durian", 6800));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("fig", 50));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("grapefruit", 246));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("grape", 5));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("guava", 200));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("jackfruit", 6800));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("kiwi", 75));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("lemon", 100));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("lime", 50));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("mango", 200));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("melon", 1500));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("nectarine", 150));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("olive", 5));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("orange", 130));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("papaya", 450));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("peach", 150));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("pear", 180));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("pineapple", 1590));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("plum", 65));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("pomegranate", 255));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("pumpkin", 4500));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("raspberry", 5));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("strawberry", 12));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("watermelon", 9000));

    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("asparagu", 22));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("garlic", 5));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("green bean", 5));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("beet", 113));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("bell pepper", 170));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("broccoli", 225));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("brussel sprout", 14));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("cabbage", 750));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("capsicum", 170));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("carrot", 60));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("cauliflower", 500));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("celery", 450));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("corn", 180));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("cucumber", 250));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("kale", 198));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("lettuce", 800));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("mushroom", 15));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("onion", 160));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("parsnip", 115));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("pea", 0.2));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("potato", 184));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("potatoe", 184));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("snow pea", 2.5));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("spinach", 30));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("squash", 200));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("butternut", 1100));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("sweet potato", 113));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("sweet potatoe", 113));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("tomato", 170));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("tomatoe", 170));
    fruitAndVegWeights.push(new FruitAndVegetableWeightObject("zucchini", 200));
}
//#endregion

function Init()
{
    AddFruitAndVegetableWeightsToArray();
    InitialiseButtons();
    ResetRecipePage();
    LoadAllUserRecipes();
    ProcessPageStatus(CheckRecipeStatus());
    ResetRecipeStatus();
}

function InitialiseButtons()
{
    $("#saveRecipeButton").click(SaveRecipe);

    $("#displayEditRecipeNameButton").click(OpenEditRecipeNameElement);
    $("#displayAddIngredientButton").click(OpenAddIngredientElement);
    $("#displayAddInstructionButton").click(OpenAddInstructionElement);
    $("#createNewRecipeButton").click(CreateUserRecipe);
}

function CheckRecipeStatus()
{
    if (localStorage.getItem(localStorageStringForLoadingUserRecipe) !== null) return "LoadUserRecipe";
    if (localStorage.getItem(localStorageStringForLoadingOnlineRecipe) !== null) return "LoadOnlineRecipe";
    return "LoadNothing";
}

function ResetRecipeStatus()
{
    localStorage.removeItem(localStorageStringForLoadingUserRecipe);
    localStorage.removeItem(localStorageStringForLoadingOnlineRecipe);
}

function ProcessPageStatus(pageStatus)
{
    switch (pageStatus) 
    {
        case "LoadUserRecipe": LoadSpecificUserRecipe(); break;
        case "LoadOnlineRecipe": LoadOnlineRecipe(); break;
        case "LoadNothing": CreateUserRecipe(); break;
        default: console.log("How did this happen??"); break;
    }
}

function ResetRecipePage()
{
    ingredientInformationListElement.empty();
    instructionInformationListElement.empty();
    recipeNameDisplayElement.text(recipeNameDefault);
}

function LoadAllUserRecipes()
{
    let savedRecipes = JSON.parse(localStorage.getItem(localStorageStringForSavingUserRecipes));

    if (savedRecipes !== null && savedRecipes.length > 0) recipes = savedRecipes;
    else console.log("No saved recipes found");
}

function LoadSpecificUserRecipe()
{
    console.log("Loading user recipe");
    recipeNameDisplayElement.text(recipeNameLoading);
    let nameOfRecipeToLoad = JSON.parse(localStorage.getItem(localStorageStringForLoadingUserRecipe));
    if (nameOfRecipeToLoad != null)
    {
        for (let i = 0; i < recipes.length; i++)
        {
            if (recipes[i].recipeSearchName === nameOfRecipeToLoad)
            {
                console.log("Loading: " + nameOfRecipeToLoad);
                DisplayRecipe(recipes[i]);
                currentRecipe = recipes[i];
                //localStorage.removeItem(localStorageStringForLoadingUserRecipe);
                break; 
            }
            RecipeNotFound(nameOfRecipeToLoad);
        }
    }
    else RecipeNotFound(nameOfRecipeToLoad);
}

function RecipeNotFound(nameOfRecipeToLoad)
{
    console.log("Recipe not found: " + nameOfRecipeToLoad);
}

function LoadOnlineRecipe()
{
    console.log("Loading online recipe");
    recipeNameDisplayElement.text(recipeNameLoading);
    let apiUrlOfRecipeToLoad = JSON.parse(localStorage.getItem(localStorageStringForLoadingOnlineRecipe));
    console.log(apiUrlOfRecipeToLoad);
    if (apiUrlOfRecipeToLoad !== null) QueryAPIForOnlineRecipes(apiUrlOfRecipeToLoad);
    else ApiUrlNotFound(apiUrlOfRecipeToLoad);
}

function ApiUrlNotFound(apiUrlOfRecipeToLoad)
{
    console.log("Api Url not found: " + apiUrlOfRecipeToLoad);
}

function QueryAPIForOnlineRecipes(apiUrlOfRecipeToLoad)
{
    fetch(apiUrlOfRecipeToLoad).then(function(response) 
    {
        if (response.ok)
        {
            response.json().then(function(recipeData)
            {
                console.log(recipeData);
                ConvertOnlineRecipeIntoUserRecipe(recipeData);
            });
        }
    });
}

var tempRecipeData;
var tempNewConvertedRecipe;

function ConvertOnlineRecipeIntoUserRecipe(recipeData)
{
    let newConvertedRecipe = new Recipe(recipeData.meals[0].strMeal, GetUrlFriendlyName(recipeData.meals[0].strMeal));

    let convertedIngredients = ConvertOnlineIngredientsIntoUserIngredients(recipeData);
    for (let i = 0; i < convertedIngredients.length; i++) 
    { 
        newConvertedRecipe.ingredients.push(convertedIngredients[i]);
        SearchWoolworthsApiForIngredient(convertedIngredients[i]);
    }
    
    tempRecipeData = recipeData;
    tempNewConvertedRecipe = newConvertedRecipe;
    CheckIfFetchIsFinished();
}

function CheckIfFetchIsFinished()
{
    if (outstandingFetchRequests.length > 0) { window.setTimeout(CheckIfFetchIsFinished, 100); }
    else
    {
        let convertedInstructions = ConvertOnlineInstructionsIntoUserInstructions(tempRecipeData);
        for (let i = 0; i < convertedInstructions.length; i++) 
        {
            if (convertedInstructions[i].length > 0) tempNewConvertedRecipe.instructions.push(convertedInstructions[i]); 
        }
    
        tempNewConvertedRecipe.estimatedCost = GetEstimatedCostOfRecipe(tempNewConvertedRecipe);
        currentRecipe = tempNewConvertedRecipe;
        DisplayRecipe(tempNewConvertedRecipe);
    }
}

function GetEstimatedCostOfRecipe(recipe)
{
    let cost = 0;
    for (let i = 0; i < recipe.ingredients.length; i++) 
    {
        if (isNaN(recipe.ingredients.meanPrice) === false) cost += recipe.ingredients.meanPrice;
    }
    return cost;
}

function ConvertOnlineIngredientsIntoUserIngredients(recipeData)
{
    let ingredientArray = [];

    //The online recipes can have up to 20 ingredients and for some reason they aren't stored in an array
    for (let i = 1; i <= 20; i++)
    {
        let mealPath = recipeData.meals[0];
        let ingredient = "strIngredient" + i;
        let measurement = "strMeasure" + i;

        if (mealPath[ingredient] != "" && mealPath[ingredient] != null && mealPath[measurement] != "" && mealPath[measurement] != null) 
        {
            let ingredientName = GetSanitisedName(recipeData.meals[0][ingredient]);
            let quantityAndUnits = ParseOnlineRecipeIngredientUnitAndQuantity(recipeData.meals[0][measurement], ingredientName);
            let ingredientQuantity = quantityAndUnits[0];
            let ingredientUnits = quantityAndUnits[1];
            ingredientQuantity = ConvertWeightIntoGramsOrML(ingredientQuantity, ingredientUnits);
            ingredientUnits = GramsOrML(ingredientUnits);

            ingredientArray.push(new Ingredient(ingredientName, parseFloat(ingredientQuantity), ingredientUnits));
        }
    }

    return ingredientArray;
}

function ConvertOnlineInstructionsIntoUserInstructions(recipeData)
{
    return recipeData.meals[0].strInstructions.split(/[.!?]/);
}

function ParseOnlineRecipeIngredientUnitAndQuantity(quantityAndUnits, ingredientName)
{
    let quantityAndUnitsLowercase = quantityAndUnits.toLowerCase();
    let numbers = 0;
    if (quantityAndUnitsLowercase.includes("/")) 
    {
        numbers = quantityAndUnitsLowercase.replace(/[^0-9/]/g, '');
        let numbersSplit = numbers.split("/");
        numbers = parseFloat(numbersSplit[0] / numbersSplit[1]);
    }
    else numbers = parseFloat(quantityAndUnitsLowercase.replace(/[^0-9]/g, ''));
    let letters = quantityAndUnitsLowercase.replace(/[^a-z]/g, '');
    let quantityAndUnitsParsed = [0, ""];

    let standardUnit = IsStandardUnit(letters);
    if (standardUnit !== null)
    {
        if (numbers !== null && isNaN(numbers) === false) quantityAndUnitsParsed[0] = numbers;
        else quantityAndUnitsParsed[0] = 1;

        quantityAndUnitsParsed[1] = standardUnit;
        return quantityAndUnitsParsed;
    }

    let cupOrSpoonMeasure = IsUnitACupOrSpoonMeasure(letters)
    if (cupOrSpoonMeasure !== null)
    {
        if (numbers !== null && isNaN(numbers) === false) quantityAndUnitsParsed[0] = numbers * cupOrSpoonMeasure;
        else quantityAndUnitsParsed[0] = cupOrSpoonMeasure;

        quantityAndUnitsParsed[1] = "g"; 
        return quantityAndUnitsParsed;
    }

    let otherMeasure = IsOtherMeasure(letters)
    if (otherMeasure !== null)
    {
        if (numbers !== null && isNaN(numbers) === false) quantityAndUnitsParsed[0] = numbers * otherMeasure;
        else quantityAndUnitsParsed[0] = otherMeasure;

        quantityAndUnitsParsed[1] = "g";
        return quantityAndUnitsParsed;
    }

    let fruitAndVegWeight = GetEstimatedWeightOfFruitsAndVegetables(ingredientName);
    if (fruitAndVegWeight !== null)
    {
        if (numbers !== null && isNaN(numbers) === false) quantityAndUnitsParsed[0] = numbers * fruitAndVegWeight;
        else quantityAndUnitsParsed[0] = fruitAndVegWeight;

        quantityAndUnitsParsed[1] = "g"; 
        return quantityAndUnitsParsed;
    }

    quantityAndUnitsParsed[0] = 5;
    quantityAndUnitsParsed[1] = "g";
    return quantityAndUnitsParsed;
}

function IsStandardUnit(str)
{
    switch(str)
    {
        case "kilograms": return "kg";
        case "kilogram": return "kg";
        case "kilos": return "kg";
        case "kilo": return "kg";
        case "perkg": return "kg";
        case "kgpunnet": return "kg";
        case "kgbag": return "kg";
        case "kg": return "kg";

        case "grams": return "g";
        case "perg": return "g";
        case "gpunnet": return "g";
        case "gbag": return "g";
        case "g": return "g";
        
        case "mg": return "mg";
        case "permg": return "mg";

        case "perl": return "l";
        case "l": return "l";

        case "perml": return "ml";
        case "ml": return "ml";
        
        default: return null;
    }
}

function IsUnitACupOrSpoonMeasure(str)
{
    switch (str) {
        case "cup": return 160;
        case "cups": return 160;

        case "tablespoon": return 20;
        case "tblsp": return 20;
        case "tblp": return 20;
        case "tbsp": return 20;
        case "tbls": return 20;
        case "tbs": return 20;
        
        case "teaspoon": return 5;
        case "tspn": return 5;
        case "tsp": return 5;
    
        default: return null;
    }
}

function IsOtherMeasure(str)
{
    switch (str) 
    {
        case "pinch": return 5;
        case "topping": return 5;
        case "dash": return 5;
        case "garnish": return 5;
        case "totaste": return 5;
        case "sprigof": return 5;
        case "sprigsof": return 5;
        case "sprigoffresh": return 5;
        case "sprigsoffresh": return 5;
    
        default: return null;
    }
}

function SearchWoolworthsApiForIngredient(ingredient)
{
    QueryWoolworthsAPI(GetIngredientUrl(GetUrlName(ingredient.ingredientName)), ingredient, false);
}

function GetIngredientUrl(ingredientUrlName)
{
    return "https://www.woolworths.com.au/apis/ui/Search/products?searchTerm=" + ingredientUrlName + "&sortType=TraderRelevance&pageSize=20";
}

function GetUrlName(initialName)
{
    //Spaces are represented by %20 in a url
    return initialName.replace(/\s/g, "%20");
}

function QueryWoolworthsAPI(ingredientUrl, ingredient, displayIngredientOnCompletion)
{
    let fetchName = ingredient.ingredientName;
    outstandingFetchRequests.push(fetchName);
    fetch(ingredientUrl).then(function (response) 
    {
        if (response.ok) 
        {
            response.json().then(function (apiResponseData) 
            {
                //console.log(apiResponseData);
                RemoveFetchNameFromOutstandingList(fetchName);
                if (apiResponseData.Products != null) ConvertWoolworthsApiResponseIntoAWoolworthsProductClass(apiResponseData, ingredient, displayIngredientOnCompletion);
                else IngredientNotFound(ingredient);
            });
        }
    });
}

function RemoveFetchNameFromOutstandingList(fetchName)
{
    for (let i = 0; i < outstandingFetchRequests.length; i++) 
    {
        if (outstandingFetchRequests[i] === fetchName) outstandingFetchRequests.splice(i, 1);
    }
}

function ConvertWoolworthsApiResponseIntoAWoolworthsProductClass(apiResponseData, ingredient, displayIngredientOnCompletion)
{
    let newWoolworthsProducts = [];

    for (let i = 0; i < apiResponseData.Products.length; i++) 
    {
        let productPath = apiResponseData.Products[i].Products[0];

        if (productPath.IsAvailable)
        {
            let productName = apiResponseData.Products[i].DisplayName;
            let productImageUrl = productPath.DetailsImagePaths[0];
            let productStockCode = productPath.Stockcode;

            //Get the original unit (ie kg, g, ml etc) for each product
            let originalUnits = GetProductUnitType(productPath.PackageSize);

            if (originalUnits !== "error")
            {
                //If the product is a fruit or vegetable then its weight may need to be estimated
                let isOriginalWeightEstimated = (originalUnits === "each" ? true : false);

                //If it is estimated then the units will be in grams, otherwise they might be grams or ml
                let normalisedUnit;
                if (isOriginalWeightEstimated) normalisedUnit = "g";
                else normalisedUnit = GramsOrML(originalUnits);

                //Get the original weight for each product
                let originalWeight = GetProductWeightWithoutUnits(productPath.PackageSize, isOriginalWeightEstimated, productName);

                let originalPrice = productPath.Price;
                
                //Make sure none of the original values are null, then try to convert the price into $/gram or $/ml for easy calculation
                if (originalUnits !== null && originalWeight !== null && originalPrice !== null)
                {
                    let pricePerGramOrML = NormalisePrice(originalWeight, originalUnits, originalPrice);

                    if (isNaN(pricePerGramOrML) === false)
                    {
                        newWoolworthsProducts = BubbleSortPrices(newWoolworthsProducts);
                        let newWoolworthsProduct = new WoolworthsProduct(productName, productImageUrl, productStockCode, originalWeight, isOriginalWeightEstimated, originalUnits, originalPrice, pricePerGramOrML, normalisedUnit);
                        newWoolworthsProducts.push(newWoolworthsProduct);
                    }
                }
                else console.log(apiResponseData.Products[i].DisplayName + " was removed as either the price or units or the weight were null.");
            }
        }
        else console.log(apiResponseData.Products[i].DisplayName + " was removed as it is unavailable.");
    }

    if (newWoolworthsProducts.length > 0)
    {
        let medianPrice = parseFloat(GetMedianPrice(newWoolworthsProducts));
        let minPriceIndex = GetIndexOfMinOrMaxPrice(true, newWoolworthsProducts);
        let maxPriceIndex = GetIndexOfMinOrMaxPrice(false, newWoolworthsProducts);
        ingredient.AddWoolworthsProductInformation(newWoolworthsProducts, minPriceIndex, maxPriceIndex, medianPrice);
        if (displayIngredientOnCompletion)
        {
            DisplayIngredient(ingredient);
            UpdateRecipeCost(currentRecipe);
            DisplayEstimatedCost(currentRecipe);
        }
    }
    else { NoUsableProductsWereFound(ingredient.ingredientName); return null; }
}

function IngredientNotFound()
{

}

function GetProductUnitType(productSize)
{
    let productSizeLowercase = productSize.toLowerCase();
    let productSizeLettersOnly = productSizeLowercase.replace(/[^a-z]/g, '');

    //Special case for fruits and vegetables sold individually as their weights aren't listed and need to be estimated
    if (productSizeLettersOnly === "each" || productSizeLettersOnly === "ea") return "each";

    switch(productSizeLettersOnly)
    {
        case "perkg": return "kg";
        case "kgpunnet": return "kg";
        case "kgbag": return "kg";
        case "kg": return "kg";

        case "perg": return "g";
        case "gpunnet": return "g";
        case "gbag": return "g";
        case "g": return "g";
        
        case "mg": return "mg";
        case "permg": return "mg";

        case "perl": return "l";
        case "l": return "l";

        case "perml": return "ml";
        case "ml": return "ml";
        
        default: console.log("Unable to extract product weight unit: " + "\"" + productSizeLettersOnly + "\"." ); return "error";
    }
}

function GramsOrML(packageUnit)
{
    if (packageUnit === "kg" || packageUnit === "g" || packageUnit === "mg" || packageUnit === "each" ) return "g";
    else return "ml";
}

function GetProductWeightWithoutUnits(productWeight, shouldWeightBeEstimated, productName)
{
    if (shouldWeightBeEstimated) { return GetEstimatedWeightOfFruitsAndVegetables(productName); }
    else
    {
        let productWeightLowercase = productWeight.toLowerCase();
        if (productWeightLowercase.includes("per")) return 1;

        let packageWeightNoLetters = productWeightLowercase.replace(/[a-z]/g, '');
        return packageWeightNoLetters;
    }
}

function GetEstimatedWeightOfFruitsAndVegetables(name)
{
    let nameLowercase = name.toLowerCase();
    //If plural, remove the plural, of course if it's a plural es then we're fucked
    if (nameLowercase[nameLowercase.length - 1] === "s") nameLowercase.slice(0, -1);

    for (let i = 0; i < fruitAndVegWeights.length; i++)
    {
        if (nameLowercase.includes(fruitAndVegWeights[i].name)) return fruitAndVegWeights[i].estimatedWeight;
    }
    return null;
}

function ConvertWeightIntoGramsOrML(weight, packageType)
{
    if (packageType === "each" || packageType === "g" || packageType === "ml") return weight;
    if (packageType === "kg") return weight * 1000;
    if (packageType === "mg") return weight / 1000;
    if (packageType === "l") return weight * 1000;
}

function NormalisePrice(originalWeight, originalUnits, originalPrice)
{
    let productWeightInGramsOrML = ConvertWeightIntoGramsOrML(originalWeight, originalUnits);
    return originalPrice / productWeightInGramsOrML;
}

function GetIndexOfMinOrMaxPrice(isPriceMin, productArray)
{
    let index = 0;

    if (isPriceMin)
    {
        for (let i = 1; i < productArray.length; i++) 
        {
            if (productArray[i].pricePerGramOrML < productArray[index].pricePerGramOrML) index = i;
        }
    }
    else
    {
        for (let i = 1; i < productArray.length; i++) 
        {
            if (productArray[i].pricePerGramOrML > productArray[index].pricePerGramOrML) index = i;
        }
    }

    return index;
}

function GetMeanPrice(productArray)
{
    let total = 0;
    for (let i = 0; i < productArray.length; i++) 
    {
        total += productArray[i].pricePerGramOrML;
    }
    return parseFloat(total / productArray.length);
}

function GetMedianPrice(productArray)
{
    const middle = Math.floor(productArray.length / 2);
    return parseFloat(productArray[middle].pricePerGramOrML);
}

function BubbleSortPrices(array)
{
    for (let i = 0; i < array.length; i++) 
    {
        for (let j = 0; j < (array.length - i - 1); j++)
        {
            if (array[j + 1].pricePerGramOrML > array[j].pricePerGramOrML)
            {
                [array[j + 1], array[j]] = [array[j], array[j + 1]]
            }
        }
    }
    return array;
}

function NoUsableProductsWereFound(productName)
{
    console.log("We couldn't find enough products that match the requirements for " + productName + ". We apologise for the inconvenience.");
}

function DisplayRecipe(recipeToDisplay)
{
    recipeNameDisplayElement.text(recipeToDisplay.recipeName);
    for (let i = 0; i < recipeToDisplay.ingredients.length; i++) { DisplayIngredient(recipeToDisplay.ingredients[i]); }
    for (let i = 0; i < recipeToDisplay.instructions.length; i++) { DisplayInstruction(recipeToDisplay.instructions[i]); }
    UpdateRecipeCost(recipeToDisplay);
    DisplayEstimatedCost(recipeToDisplay);
    console.log(currentRecipe);
}

function DisplayIngredient(ingredient)
{
    let ingredientListItemElement = $("<li></li>");

    let ingredientContainerElement = $("<div class='columns'></div>");
    let ingredientQuantityElement = $("<div class='column is-1 is-offset-3 ingredientUnit'>" + ingredient.ingredientQuantity + ingredient.ingredientUnits + "</div>");
    let ingredientNameElement = $("<div class='column is-4'>" + CapitaliseFirstLetterOfString(ingredient.ingredientName) + "</div>");

    let ingredientMeanPriceElement;
    if (ingredient.woolworthsProducts.length > 0) ingredientMeanPriceElement = $("<div class='column is-5 meanPrice ingredientPrice'>Price: $" + (ingredient.meanPrice * ingredient.ingredientQuantity).toFixed(2) + "<div/>");
    else ingredientMeanPriceElement = $("<div class='column is-5 meanPrice ingredientPrice'>No matching products found<div/>");

    ingredientQuantityElement.appendTo(ingredientContainerElement);
    ingredientNameElement.appendTo(ingredientContainerElement);
    ingredientMeanPriceElement.appendTo(ingredientContainerElement);

    ingredientContainerElement.appendTo(ingredientListItemElement);
    ingredientListItemElement.appendTo(ingredientInformationListElement);
}

function DisplayInstruction(instruction)
{
    let instructionElement = $("<li>" + instruction + "</li>");
    instructionElement.appendTo(instructionInformationListElement);
}

function UpdateRecipeCost(recipe)
{
    let cost = 0;
    for (let i = 0; i < recipe.ingredients.length; i++)
    {
        if (isNaN(recipe.ingredients[i].meanPrice) === false) cost += (recipe.ingredients[i].meanPrice * recipe.ingredients[i].ingredientQuantity);
        else console.log(recipe.ingredients[i].ingredientName + "'s mean price is NaN.");
    }
    recipe.estimatedCost = cost;
}

function DisplayEstimatedCost(recipe)
{
    approximateCostElement.text("Estimated total cost: $" + (parseFloat(recipe.estimatedCost)).toFixed(2));
}

function CreateUserRecipe()
{
    ResetRecipePage();
    currentRecipe = new Recipe();
    UpdateRecipeCost(currentRecipe);
    DisplayEstimatedCost(currentRecipe);
}

function ChangeRecipeName()
{
    let recipeNameInputElement = addRecipeInformationContainerElement.children("#recipeNameInput");
    let recipeName = RemoveEverythingFromStringExceptLettersSpacesHyphensAndApostrophes(recipeNameInputElement.val());

    if (recipeName.length > 0)
    {
        recipeNameInputElement.val("");
        recipeNameDisplayElement.text(recipeName);
        currentRecipe.recipeName = recipeName;
        currentRecipe.recipeSearchName = GetUrlFriendlyName(recipeName);
    }
}

function AddIngredient()
{
    let ingredientWeightInputElement = $("#ingredientWeightInput");
    let ingredientNameInputElement = $("#ingredientNameInput");

    let ingredientName = GetSanitisedName(ingredientNameInputElement.val());
    let ingredientWeight = ingredientWeightInputElement.val();
    //Don't you dare ask why this stupid line exists
    let ingredientUnit = $("#ingredientUnitInput").clone().children().remove().end().text();

    if (ingredientName.length > 0 && ingredientWeight > 0)
    {
        ingredientWeightInputElement.val("");
        ingredientNameInputElement.val("");
    
        if (ingredientUnit === "kg")
        {
            ingredientUnit = "g"
            ingredientWeight = ingredientWeight * 1000;
        }
        else if (ingredientUnit === "l")
        {
            ingredientUnit = "ml"
            ingredientWeight = ingredientWeight * 1000;
        }
    
        let newIngredient = new Ingredient(ingredientName, parseFloat(ingredientWeight), ingredientUnit);
    
        currentRecipe.ingredients.push(newIngredient);
    
        console.log(newIngredient);
        QueryWoolworthsAPI(GetIngredientUrl(GetUrlName(newIngredient.ingredientName)), newIngredient, true);
    }
    else PleaseProvideAllTheRelevantInformation();
}

function AddInstruction()
{
    let instructionElement = addRecipeInformationContainerElement.children("#instructionInput");
    let instruction = instructionElement.val();

    if (instruction.length > 0)
    {
        instructionElement.val("");
        currentRecipe.instructions.push(instruction);
        DisplayInstruction(instruction);
    }
}

function SaveRecipe()
{
    if (currentRecipe.recipeName != null && currentRecipe.recipeName.length > 0)
    {
        recipes.push(currentRecipe);
        localStorage.setItem(localStorageStringForSavingUserRecipes, JSON.stringify(recipes));
    }
    else PleaseEnterAName();
}

function PleaseEnterAName()
{
    console.log("Please enter a name for the recipe");
}

function GetSanitisedName(initialName)
{
    let name = initialName.toLowerCase();
    //Remove everything that isn't a letter or a space
    name.replace(/[^a-z-' \s]/g, '');
    //Capitalise the first letter
    name.charAt(0).toUpperCase() + name.slice(1);

    return name;
}

function GetUrlFriendlyName(str) 
{ 
    let name = str.toLowerCase();
    name = name.replace(/[^a-z \s]/g, '');
    return name.replace(/[\s]/g, "%20"); 
}

function PleaseProvideAllTheRelevantInformation()
{
    console.log("Missing information");
}

function OpenEditRecipeNameElement()
{
    addRecipeInformationContainerElement.empty();

    let newInputElement = $("<input class='column is-6 is-offset-2' type='text' placeholder='Enter a name for your recipe' id='recipeNameInput'>");
    let newButtonElement = $("<div class='column is-2 recipePageButton' id='editRecipeNameButton'>Add name</div>");

    newButtonElement.click(ChangeRecipeName);
    newInputElement.appendTo(addRecipeInformationContainerElement);
    newButtonElement.appendTo(addRecipeInformationContainerElement);
}

function OpenAddIngredientElement()
{
    addRecipeInformationContainerElement.empty();

    let newInputWeightElement = $("<input class='column is-2 is-offset-1' type='text' placeholder='Weight' id='ingredientWeightInput'>");
    let newSelectElement = $("<div class='column is-1' id='ingredientUnitInput'>g</div>");

    let newSelectionElements = $("<div class='hide' id='unitContainer'><div class='unit'>g</div><div class='unit'>kg</div><div class='unit'>ml</div><div class='unit'>l</div></div>");
    newSelectionElements.appendTo(newSelectElement);
    // $("#unitContainer").click(ChangeUnit);

    //let newSelectElement = $("<select class='column is-1' name='units' id='ingredientUnitInput'><option value='g'>g</option><option value='kg'>kg</option><option value='ml'>ml</option><option value='l'>l</option></select>");
    //let newSelectElement = $("<div class='select is-rounded column is-1' name='units' id='ingredientUnitInput'><select><option value='g'>g</option><option value='kg'>kg</option><option value='ml'>ml</option><option value='l'>l</option></select></div>");
    let newInputNameElement = $("<input class='column is-5' type='text' placeholder='Ingredient name' id='ingredientNameInput'>");
    let newButtonElement = $("<div class='column is-2 recipePageButton' id='addInstructionButton'>Add Ingredient</div>");

    newSelectElement.click(ToggleUnitSelector);
    newButtonElement.click(AddIngredient);
    newInputWeightElement.appendTo(addRecipeInformationContainerElement);
    newSelectElement.appendTo(addRecipeInformationContainerElement);
    newInputNameElement.appendTo(addRecipeInformationContainerElement);
    newButtonElement.appendTo(addRecipeInformationContainerElement);
}

function OpenAddInstructionElement()
{
    addRecipeInformationContainerElement.empty();

    let newInputElement = $("<input class='column is-6 is-offset-2' type='text' placeholder='Enter instruction' id='instructionInput'>");
    let newButtonElement = $("<div class='column is-2 recipePageButton' id='addInstructionButton'>Add Instruction</div>");

    newButtonElement.click(AddInstruction);
    newInputElement.appendTo(addRecipeInformationContainerElement);
    newButtonElement.appendTo(addRecipeInformationContainerElement);
}

function ToggleUnitSelector(event)
{
    let selectionElement = $("#unitContainer");
    
    if (selectionElement.hasClass("hide"))
    {
        selectionElement.removeClass("hide");
        selectionElement.addClass("show");
    }
    else
    {
        selectionElement.removeClass("show");
        selectionElement.addClass("hide");

        if (event.target !== this) ChangeUnit(event);
    }
}

function ChangeUnit(event)
{
    $("#ingredientUnitInput").text($(event.target).text());
    //For some damn reason the children of the #ingredientUnitInput keep getting deleted whenever the event is triggered, and I couldn't figure out why so I just make them again
    let newSelectionElements = $("<div class='hide' id='unitContainer'><div class='unit'>g</div><div class='unit'>kg</div><div class='unit'>ml</div><div class='unit'>l</div></div>");
    newSelectionElements.appendTo($("#ingredientUnitInput"));
}

function RemoveSpacesFromString(str) { return str.replace(/[\s]/g, ''); }
function CapitaliseFirstLetterOfString(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function RemoveEverythingFromStringExceptLettersSpacesHyphensAndApostrophes(str) { return str.replace(/[^a-zA-Z-' \s]/g, ''); }

Init();