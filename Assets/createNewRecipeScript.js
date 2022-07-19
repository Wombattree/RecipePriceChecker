var ingredientInformationListElement = $("#ingredientInformation");
var instructionInformationListElement = $("#instructionInformation");

var addIngredientContainerElement = $("#addIngredientContainer");
var ingredientQuantitySelectorElement = $("#ingredientQuantitySelector");
var ingredientUnitySelectorElement = $("#ingredientUnitsSelector");
var ingredientSearchBoxElement = $("#ingredientSearchBox");

var instructionsInputBoxElement = $("#instructionsInputBox");

//All products that have had their information extracted and displayed
var allListedProducts = [];

var allListedIngredients = [];
var allListedInstructions = [];

var recipeNameDefault = "Please enter a name for your recipe";

var allRecipes = [];

class Recipe
{
    name;
    searchName;
    ingredients = [];
    instructions = [];
    cost;

    AddIngredient(ingredient)
    {
        this.ingredients.push(ingredient);
    }

    AddInstruction(instruction)
    {
        this.instructions.push(instruction);
    }

    AddName(name, searchName)
    {
        this.name = name;
        this.searchName = searchName;
    }

    UpdateCost(cost)
    {
        this.cost = cost;
    }
}

class IngredientEntry
{
    constructor(ingredientQuantity, ingredientUnit, ingredientName)
    {
        this.ingredientQuantity = ingredientQuantity;
        this.ingredientUnit = ingredientUnit;
        this.ingredientName = ingredientName;
    }

    AddProductTypeInformation(productType)
    {
        this.productType = productType;
    }
}

//A type of product, ie potatoes or apples or bacon
class ProductType
{
    constructor(productType, productArray) 
    {
        this.productType = productType;
        this.productArray = productArray;
    }
}

//An individual product, ie "Woolworths Washed Potatoes 2kg"
class Product
{
    constructor(productName, productImageUrl, productStockcode, originalWeight, isOriginalWeightEstimated, originalUnits, originalPrice, pricePerGramOrML, normalisedUnit) 
    {
        this.productName = productName;
        this.productImageUrl = productImageUrl;
        this.productStockcode = productStockcode;
        this.originalWeight = originalWeight;
        this.isOriginalWeightEstimated = isOriginalWeightEstimated;
        this.originalUnits = originalUnits;
        this.originalPrice = originalPrice;
        this.pricePerGramOrML = pricePerGramOrML;
        this.normalisedUnit = normalisedUnit;
    }
}

function Init()
{
    AddFruitsAndVegetablesToArray();
    CreateNewRecipe();
    IsThisANewRecipeOrALoadedRecipe();
    IsThisAnOnlineRecipe();
}

function IsThisANewRecipeOrALoadedRecipe()
{
    let recipeLoadInformation = JSON.parse(localStorage.getItem("RecipePriceCheckerPageToLoad"));
    if (recipeLoadInformation != null && recipeLoadInformation.length > 0)
    {
        LoadSpecificRecipe(recipeLoadInformation);
        localStorage.removeItem("RecipePriceCheckerPageToLoad");
    }
}

function IsThisAnOnlineRecipe()
{
    let recipeLoadInformation = JSON.parse(localStorage.getItem("RecipePriceCheckerOnlineRecipeToLoad"));
    if (recipeLoadInformation != null && recipeLoadInformation.length > 0)
    {
        console.log("Loading online recipe");
        LoadOnlineRecipe(recipeLoadInformation);
        localStorage.removeItem("RecipePriceCheckerOnlineRecipeToLoad");
    }
}

// function IngredientEntered(event)
// {
//     //If the event was triggered by the enter key
//     if (event.keyCode === 13) AddIngredient();
// }

function AddIngredient()
{
    let ingredientQuantity = ingredientQuantitySelectorElement.val();
    let ingredientUnit = ingredientUnitySelectorElement.val();

    ingredientQuantitySelectorElement.val("");
    ingredientUnitySelectorElement.val("");

    if (ingredientUnit === "kg")
    {
        ingredientUnit = "g"
        ingredientQuantity = ingredientQuantity * 1000;
    } 
    else if (ingredientUnit === "l")
    {
        ingredientUnit = "ml"
        ingredientQuantity = ingredientQuantity * 1000;
    }

    let ingredientName = ingredientSearchBoxElement.val();
    ingredientName = GetSanitisedName(ingredientName);
    let ingredientURLName = GetURLName(ingredientName);

    let newIngredientEntry = new IngredientEntry(ingredientQuantity, ingredientUnit, ingredientName);

    QueryAPI(GetProductUrl(ingredientURLName), ingredientName, newIngredientEntry);
}

function GetSanitisedName(initialName)
{
    let name = initialName.toLowerCase();
    //Remove everything that isn't a letter or a space
    return name.replace(/[^a-z \s]/g, '');
}

function GetURLName(initialName)
{
    //Spaces are represented by %20 in the url
    return initialName.replace(/\s/g, "%20");
}

function SanitiseUserEntry(event)
{
    let name = $(event.target).val();
    //Remove everything that isn't a letter or a space
    name = name.replace(/[^a-z \s]/g, '');
    //Spaces are represented by %20 in the url
    let URLname = name.replace(/\s/g, "%20");

    GetProductUrl(name, URLname);
}

function GetProductUrl(productUrlName)
{
    return "https://www.woolworths.com.au/apis/ui/Search/products?searchTerm=" + productUrlName + "&sortType=TraderRelevance&pageSize=20";
}

function QueryAPI(url, productName, newIngredientEntry)
{
    fetch(url).then(function (response) 
    {
        if (response.ok) 
        {
            response.json().then(function (data) 
            {
                console.log(data);

                let tidyProductName = TidyProductName(data, productName);

                if (data.Products != null)
                {
                    newIngredientEntry.ingredientName = tidyProductName;
                    ExtractRelevantProductInformationFromAPI(data, tidyProductName, newIngredientEntry);
                } 
                //if (data.Products != null) return data;
                else { ProductNotFound(tidyProductName); return null; }
            });
        }
    });
}

function TidyProductName(data, productName)
{
    let newProductName = data.SuggestedTerm == null ? productName : data.SuggestedTerm;
    newProductName = newProductName.charAt(0).toUpperCase() + newProductName.slice(1);
    newProductName.replace("%20", " ");

    return newProductName;
}

function ExtractRelevantProductInformationFromAPI(data, productName, newIngredientEntry)
{
    let newProductArray = [];

    for (let i = 0; i < data.Products.length; i++)
    {
        let productPath = data.Products[i].Products[0];

        if (productPath.IsAvailable)
        {
            let productName = data.Products[i].DisplayName;
            let productImageUrl = productPath.DetailsImagePaths[0];
            let productStockcode = productPath.Stockcode;

            //Get the original unit (ie kg, g, ml etc) for each product
            let originalUnits = GetProductUnitType(productPath.PackageSize);

            //If it was able to parse the original units
            if (originalUnits != "error")
            {
                //If the product is fruit or vegetable then its weight may need to be estimated
                let isOriginalWeightEstimated = (originalUnits === "each" ? true : false);

                //If it is estimated then the units will be in grams, otherwise they might be grams or ml
                let normalisedUnit;
                if (isOriginalWeightEstimated) normalisedUnit = "g";
                else normalisedUnit = GramsOrML(originalUnits);

                //Get the original weight for each product
                let originalWeight = GetProductWeightWithoutUnits(productPath.PackageSize, isOriginalWeightEstimated, productName);

                let originalPrice = productPath.Price;
                
                //Make sure none of the original values are null, then try to convert the price into $/gram or $/ml for easy calculation
                if (originalUnits != null && originalWeight != null && originalPrice != null)
                {
                    let pricePerGramOrML = NormalisePrice(originalWeight, originalUnits, originalPrice);

                    let newProduct = new Product(productName, productImageUrl, productStockcode, originalWeight, isOriginalWeightEstimated, originalUnits, originalPrice, pricePerGramOrML, normalisedUnit);
                    newProductArray.push(newProduct);
                }
                else console.log(data.Products[i].DisplayName + " was removed as either the price or units or the weight were null.");
            }
        }
        else console.log(data.Products[i].DisplayName + " was removed as it is unavailable.");
    }

    if (newProductArray.length > 0)
    {
        let newProductType = new ProductType(productName, newProductArray);
        console.log(newProductType);

        allListedProducts.push(newProductType);
        newIngredientEntry.AddProductTypeInformation(newProductType);
        allListedIngredients.push(newIngredientEntry);
        CreateNewProductInformationElements(newIngredientEntry);
    }
    else { NoUsableProductsWereFound(productName); return null; }
}

function GetProductUnitType(productSize)
{
    let productSizeLowercase = productSize.toLowerCase();
    let productSizeLettersOnly = productSizeLowercase.replace(/[^a-z]/g, '');

    //Special case for fruits and vegetables sold individually as their weights aren't listed and need to be estimated
    if (productSizeLettersOnly == "each" || productSizeLettersOnly == "ea") return "each";

    switch(productSizeLettersOnly)
    {
        case "perkg": return "kg";
        case "kgpunnet": return "kg";
        case "kgbag": return "kg";
        case "gbag": return "kg";
        case "kg": return "kg";

        case "perg": return "g";
        case "gpunnet": return "g";
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

function CreateNewProductInformationElements(newIngredientEntry)
{
    let ingredientContainerElement = $("<li></li>");

    let ingredientQuantityElement = $("<div>" + newIngredientEntry.ingredientQuantity + newIngredientEntry.ingredientUnit + "</div>");
    let ingredientNameElement = $("<li>" + newIngredientEntry.productType.productType + "</li>");
    let productArray = newIngredientEntry.productType.productArray;

    //CreateMinOrMaxPriceElement(true, productArray, GetIndexOfMinOrMaxPrice(true, productArray), ingredientNameElement);
    //CreateMinOrMaxPriceElement(false, productArray, GetIndexOfMinOrMaxPrice(false, productArray), ingredientNameElement);

    let ingredientMeanPriceElement = $("<p class='meanPrice'>Estimated price for " + newIngredientEntry.ingredientQuantity + newIngredientEntry.ingredientUnit + ": $" + (GetMeanPrice(productArray) * newIngredientEntry.ingredientQuantity).toFixed(2) + "<p/>");

    ingredientQuantityElement.appendTo(ingredientContainerElement);
    ingredientNameElement.appendTo(ingredientContainerElement);

    ingredientMeanPriceElement.appendTo(ingredientNameElement);

    ingredientContainerElement.appendTo(ingredientInformationListElement);

    GetAppoximateRecipeCost();
}

function GetAppoximateRecipeCost()
{
    let meanCosts = $("#ingredientInformation").find(".meanPrice");
    let totalCostInCents = 0;
    for (let i = 0; i < meanCosts.length; i++) 
    {
        let wholeString = meanCosts[i].outerText;
        let costString = parseFloat(wholeString.substring(wholeString.indexOf("$") + 1));
        totalCostInCents += costString * 100;
    }
    $("#approximateCost").text("Estimated total cost: $" + totalCostInCents / 100);
}

function CreateMinOrMaxPriceElement(isPriceMin, productArray, productArrayIndex, elementToAppendTo)
{
    let ingredientPriceElement = $("<p>" + (isPriceMin ? "Min" : "Max") + " price ($/100g): $" + (productArray[productArrayIndex].pricePerGramOrML * standardWeightToDisplay).toFixed(2) + "<p/>");
    let ingredientPriceProductTitleElement = $("<p>" + (productArray[productArrayIndex].productName) + "<p/>");
    let ingredientPriceProductPriceElement = $("<p>$" + (productArray[productArrayIndex].originalPrice) + "<p/>");
    let ingredientPriceProductImageElement = $("<a href=\"https://www.woolworths.com.au/shop/productdetails/" + (productArray[productArrayIndex].productStockcode) + "\" target=\"_blank\" rel=\"noopener noreferrer\"><image src=\"" + (productArray[productArrayIndex].productImageUrl)+"\" alt=\"Image of product\" class=\"previewImage\"></a>");

    ingredientPriceElement.appendTo(elementToAppendTo);
    ingredientPriceProductTitleElement.appendTo(elementToAppendTo);
    ingredientPriceProductPriceElement.appendTo(elementToAppendTo);
    ingredientPriceProductImageElement.appendTo(elementToAppendTo);
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
    return total / productArray.length;
}

function GetEstimatedWeightOfFruitsAndVegetables(name)
{
    let nameLowercase = name.toLowerCase();
    //If plural, remove the plural, of course if it's a plural es then we're fucked
    if (nameLowercase[nameLowercase.length - 1] === "s") nameLowercase.slice(0, -1);

    for (let i = 0; i < fruitAndVegArray.length; i++) 
    {
        if (nameLowercase.includes(fruitAndVegArray[i].name)) return fruitAndVegArray[i].estimatedWeight;
    }
}

//Weights sourced from https://weightofstuff.com/average-weight-of-all-fruits-and-vegetables/
function AddFruitsAndVegetablesToArray()
{
    fruitAndVegArray.push(new FruitAndVegObject("apple", 195));
    fruitAndVegArray.push(new FruitAndVegObject("apricot", 35));
    fruitAndVegArray.push(new FruitAndVegObject("avocado", 170));
    fruitAndVegArray.push(new FruitAndVegObject("banana", 120));
    fruitAndVegArray.push(new FruitAndVegObject("blackberry", 2.45));
    fruitAndVegArray.push(new FruitAndVegObject("blueberry", 0.5));
    fruitAndVegArray.push(new FruitAndVegObject("cherries", 5));
    fruitAndVegArray.push(new FruitAndVegObject("coconut", 680));
    fruitAndVegArray.push(new FruitAndVegObject("cranberry", 1.13));
    fruitAndVegArray.push(new FruitAndVegObject("durian", 6800));
    fruitAndVegArray.push(new FruitAndVegObject("fig", 50));
    fruitAndVegArray.push(new FruitAndVegObject("grapefruit", 246));
    fruitAndVegArray.push(new FruitAndVegObject("grape", 5));
    fruitAndVegArray.push(new FruitAndVegObject("guava", 200));
    fruitAndVegArray.push(new FruitAndVegObject("jackfruit", 6800));
    fruitAndVegArray.push(new FruitAndVegObject("kiwi", 75));
    fruitAndVegArray.push(new FruitAndVegObject("lemon", 100));
    fruitAndVegArray.push(new FruitAndVegObject("lime", 50));
    fruitAndVegArray.push(new FruitAndVegObject("mango", 200));
    fruitAndVegArray.push(new FruitAndVegObject("melon", 1500));
    fruitAndVegArray.push(new FruitAndVegObject("nectarine", 150));
    fruitAndVegArray.push(new FruitAndVegObject("olive", 5));
    fruitAndVegArray.push(new FruitAndVegObject("orange", 130));
    fruitAndVegArray.push(new FruitAndVegObject("papaya", 450));
    fruitAndVegArray.push(new FruitAndVegObject("peach", 150));
    fruitAndVegArray.push(new FruitAndVegObject("pear", 180));
    fruitAndVegArray.push(new FruitAndVegObject("pineapple", 1590));
    fruitAndVegArray.push(new FruitAndVegObject("plum", 65));
    fruitAndVegArray.push(new FruitAndVegObject("pomegranate", 255));
    fruitAndVegArray.push(new FruitAndVegObject("pumpkin", 4500));
    fruitAndVegArray.push(new FruitAndVegObject("raspberry", 5));
    fruitAndVegArray.push(new FruitAndVegObject("strawberry", 12));
    fruitAndVegArray.push(new FruitAndVegObject("watermelon", 9000));

    fruitAndVegArray.push(new FruitAndVegObject("asparagu", 22));
    fruitAndVegArray.push(new FruitAndVegObject("garlic", 5));
    fruitAndVegArray.push(new FruitAndVegObject("green bean", 5));
    fruitAndVegArray.push(new FruitAndVegObject("beet", 113));
    fruitAndVegArray.push(new FruitAndVegObject("bell pepper", 170));
    fruitAndVegArray.push(new FruitAndVegObject("broccoli", 225));
    fruitAndVegArray.push(new FruitAndVegObject("brussel sprout", 14));
    fruitAndVegArray.push(new FruitAndVegObject("cabbage", 9070));
    fruitAndVegArray.push(new FruitAndVegObject("capsicum", 170));
    fruitAndVegArray.push(new FruitAndVegObject("carrot", 60));
    fruitAndVegArray.push(new FruitAndVegObject("cauliflower", 500));
    fruitAndVegArray.push(new FruitAndVegObject("celery", 450));
    fruitAndVegArray.push(new FruitAndVegObject("corn", 180));
    fruitAndVegArray.push(new FruitAndVegObject("cucumber", 250));
    fruitAndVegArray.push(new FruitAndVegObject("kale", 198));
    fruitAndVegArray.push(new FruitAndVegObject("lettuce", 800));
    fruitAndVegArray.push(new FruitAndVegObject("mushroom", 15));
    fruitAndVegArray.push(new FruitAndVegObject("onion", 160));
    fruitAndVegArray.push(new FruitAndVegObject("parsnip", 115));
    fruitAndVegArray.push(new FruitAndVegObject("pea", 0.2));
    fruitAndVegArray.push(new FruitAndVegObject("potato", 184));
    fruitAndVegArray.push(new FruitAndVegObject("snow pea", 2.5));
    fruitAndVegArray.push(new FruitAndVegObject("spinach", 30));
    fruitAndVegArray.push(new FruitAndVegObject("squash", 200));
    fruitAndVegArray.push(new FruitAndVegObject("butternut", 1100));
    fruitAndVegArray.push(new FruitAndVegObject("sweet potato", 113));
    fruitAndVegArray.push(new FruitAndVegObject("tomato", 170));
    fruitAndVegArray.push(new FruitAndVegObject("zucchini", 200));
}

var fruitAndVegArray = [];
class FruitAndVegObject 
{
    constructor(name, estimatedWeight) 
    {
        this.name = name;
        this.estimatedWeight = estimatedWeight;
    }
}

function CreateNewRecipe()
{
    ingredientInformationListElement.empty();
    instructionInformationListElement.empty();
    $("#recipeName").text(recipeNameDefault);
}

function SaveRecipe()
{
    let recipeName = $("#recipeName").text();
    if (recipeName === recipeNameDefault) PleaseEnterAName();
    else
    {
        let newRecipe = new Recipe();

        for (let i = 0; i < allListedIngredients.length; i++) 
        {
            newRecipe.AddIngredient(allListedIngredients[i]);
        }
        for (let i = 0; i < allListedInstructions.length; i++) 
        {
            newRecipe.AddInstruction(allListedInstructions[i]);
        }
        newRecipe.AddName(recipeName, recipeName.replace(/\s/g, ""));
        LoadAllRecipes();
        allRecipes.push(newRecipe);
        localStorage.setItem("RecipePriceCheckerRecipes", JSON.stringify(allRecipes));
    }
}

function PleaseEnterAName()
{
    console.log("The recipe nees a name");
}

function DoesRecipeAlreadyExist()
{

}

function LoadAllRecipes()
{
    let savedRecipes = JSON.parse(localStorage.getItem("RecipePriceCheckerRecipes"));

    if (savedRecipes != null && savedRecipes.length > 0)
    {
        allRecipes = savedRecipes;
    } 
    else console.log("No saved recipes found");
}

function LoadSpecificRecipe(recipeLoadInformation)
{
    LoadAllRecipes();
    for (let i = 0; i < allRecipes.length; i++) 
    {
        if (allRecipes[i].searchName === recipeLoadInformation) { DisplayLoadedRecipe(allRecipes[i]); break; }
    }
    RecipeNotFound();
}

function RecipeNotFound()
{

}

function DisplayLoadedRecipe(recipe)
{
    $("#recipeName").text(recipe.name);
    for (let i = 0; i < recipe.ingredients.length; i++)
    {
        CreateNewProductInformationElements(recipe.ingredients[i]);
    }
    for (let i = 0; i < recipe.instructions.length; i++)
    {
        CreateInstructionElement(recipe.instructions[i]);
    }
}

// function InstructionEntered(event)
// {
//     //If the event was triggered by the enter key
//     if (event.keyCode === 13) AddInstruction();
// }

function AddInstruction()
{
    let instruction = instructionsInputBoxElement.val();
    instructionsInputBoxElement.val("");

    CreateInstructionElement(instruction);

    allListedInstructions.push(instruction);
}

function CreateInstructionElement(instruction)
{
    let instructionElement = $("<li>" + instruction + "</li>");
    instructionElement.appendTo(instructionInformationListElement);
}

// function RecipeNameEntered(event)
// {
//     //If the event was triggered by the enter key
//     if (event.keyCode === 13) AddRecipeName();
// }

function AddRecipeName()
{
    $("#recipeName").text($("#recipeNameInput").val());
}

function ProductNotFound(productName)
{
    console.log("Your search for: " + "\"" + productName + "\"" + " yielded no results, please ensure that the ingredient was spelled correctly.");
}

function NoUsableProductsWereFound(productName)
{
    console.log("We coulnd't find enough products that match the requirements for " + productName + ". We apologise for the inconvenience.");
}

class OnlineRecipe
{
    constructor(recipeName, ingredients, instructions, image)
    {
        this.recipeName = recipeName;
        this.ingredients = ingredients;
        this.instructions = instructions;
        this.image = image;
    }
}

class Ingredient
{
    constructor(ingredientName, ingredientQuantity, ingredientUnits)
    {
        this.ingredientName = ingredientName;
        this.ingredientQuantity = ingredientQuantity;
        this.ingredientUnits = ingredientUnits;
    }
}

function LoadOnlineRecipe(recipeLoadInformation)
{
    QueryAPIForOnlineRecipes(recipeLoadInformation);
}

function QueryAPIForOnlineRecipes(recipeLoadInformation)
{
    fetch(recipeLoadInformation).then(function (response) 
    {
        if (response.ok) 
        {
            response.json().then(function (data) 
            {
                console.log(data);

                DisplayRecipe(data);
            });
        }
    });
}

function DisplayRecipe(data)
{
    let recipe = PullInformationIntoRecipe(data);

    let newRecipeNameElement = $("<div>" + recipe.recipeName + "</div>");
    let newRecipeElementImage = $("<image class='previewImage' src='" + recipe.image + "' alt='Recipe preview image'>");

    newRecipeNameElement.appendTo(ingredientInformationListElement);
    newRecipeElementImage.appendTo(ingredientInformationListElement);

    for (let i = 0; i < recipe.ingredients.length; i++)
    {
        let newIngredientElement = $("<div>" + recipe.ingredients[i].ingredientQuantity + " " + recipe.ingredients[i].ingredientName + "</div>");
        newIngredientElement.appendTo(ingredientInformationListElement);
    }

    let newRecipeInstructionsElement = $("<div>" + recipe.instructions + "</div>");
    newRecipeInstructionsElement.appendTo(ingredientInformationListElement);
}

function PullInformationIntoRecipe(data)
{
    let ingredientArray = [];
    for (let i = 1; i <= 20; i++) 
    {
        let ingredient = "strIngredient" + i;
        let measurement = "strMeasure" + i;

        if (data.meals[0][ingredient] != "" && data.meals[0][ingredient] != null && data.meals[0][measurement] != "" && data.meals[0][measurement] != null) 
        {
            let quantity = GetUnitsOrValueFromQuantity(false, data.meals[0][measurement]);
            let units = GetUnitsOrValueFromQuantity(true, data.meals[0][measurement]);
            ingredientArray.push(new Ingredient(data.meals[0][ingredient], quantity, units));
        }
    }

    let newOnlineRecipe = new OnlineRecipe(data.meals[0].strMeal, ingredientArray, data.meals[0].strInstructions, data.meals[0].strMealThumb);

    console.log(newOnlineRecipe);
    return newOnlineRecipe;
}

function GetUnitsOrValueFromQuantity(getUnits, quantity)
{
    if (getUnits) return quantity.replace(/[^a-z]/g, '');
    else return quantity.replace(/[^0-9]/g, '');
}

function PullInstrutionsIntoArray()
{

}

Init();

//$("#ingredientSearchBox").bind("keyup" , RecipeNameEntered);
//$("#instructionsInputBox").bind("keyup" , InstructionEntered);
//$("#recipeNameInput").bind("keyup" , IngredientEntered);

$("#addRecipeName").click(AddRecipeName);
$("#addIngredientButton").click(AddIngredient);
$("#addInstructionButton").click(AddInstruction);
$("#createNewRecipeButton").click(CreateNewRecipe);
$("#saveRecipeButton").click(SaveRecipe);