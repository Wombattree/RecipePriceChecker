var ingredientInformationListElement = $("#ingredientInformation");

//Products wil have their prices displayed with this amount as the standard ie 100g
var standardAmountToDisplay = 100;

var product = 
{
    productName: "",
    productImageUrl: "",
    productStockcode: 0,

    originalSize: "",
    originalPrice: 0,
    isOriginalSizeEstimated: false,
    
    pricePerGramOrML: 0,
    gramOrML: 0
}

function Init()
{
    AddFruitsAndVegetablesToArray();
}

function IngredientEntered(event)
{
    //If the event was triggered by the enter key
    if (event.keyCode === 13) SanitiseProductName(event);
}

function SanitiseProductName(event)
{
    //Spaces are represented by %20 in the url
    let name = $(event.target).val();
    let newName = name.replace(" ", "%20");

    GetProductUrl(newName);
}

function GetProductUrl(productName)
{
    let productApiUrl = "https://www.woolworths.com.au/apis/ui/Search/products?searchTerm=" + productName + "&sortType=TraderRelevance&pageSize=20";
    QueryAPI(productApiUrl, productName)
}

function QueryAPI(url, productName)
{
    fetch(url).then(function (response) 
    {
        if (response.ok) 
        {
            response.json().then(function (data) 
            {
                console.log(data);
                if (data.Products != null) CreateNewProductInformationElements(data, productName);
                else ProductNotFound(productName);
            });
        }
    });
}

function ExtractRelevantProductInformationFromAPI(data, productName)
{
    
}

function CreateNewProductInformationElements(data, productName)
{
    let newProductName = data.SuggestedTerm == null ? productName : data.SuggestedTerm;
    let productNameCapitalised = newProductName.charAt(0).toUpperCase() + newProductName.slice(1);
    let ingredientNameElement = $("<li>" + productNameCapitalised + "</li>");

    let newProductArray = [];
    newProductArray = GetProductArray(data);
    console.log(newProductArray);

    if (newProductArray.length > 0)
    {
        let minPriceIndex = GetIndexOfMinPrice(newProductArray);
        let maxPriceIndex = GetIndexOfMaxPrice(newProductArray);

        let ingredientMinPriceElement = $("<p>Min price ($/100g): $" + (newProductArray[minPriceIndex].pricePerGramOrML * standardAmountToDisplay).toFixed(2) + "<p/>");
        let ingredientMinPriceProductTitleElement = $("<p>" + (newProductArray[minPriceIndex].productName) + "<p/>");
        let ingredientMinPriceProductPriceElement = $("<p>$" + (newProductArray[minPriceIndex].originalPrice) + "<p/>");
        let ingredientMinPriceProductImageElement = $("<a href=\"https://www.woolworths.com.au/shop/productdetails/" + (newProductArray[minPriceIndex].productStockcode) + "\" target=\"_blank\" rel=\"noopener noreferrer\"><image src=\"" + (newProductArray[minPriceIndex].productImageUrl)+"\" alt=\"Image of product\" class=\"previewImage\"></a>");

        let ingredientMaxPriceElement = $("<p>Max price ($/100g): $" + (newProductArray[maxPriceIndex].pricePerGramOrML * standardAmountToDisplay).toFixed(2) + "<p/>");
        let ingredientMaxPriceProductTitleElement = $("<p>" + (newProductArray[maxPriceIndex].productName) + "<p/>");
        let ingredientMaxPriceProductPriceElement = $("<p>$" + (newProductArray[maxPriceIndex].originalPrice) + "<p/>");
        let ingredientMaxPriceProductImageElement = $("<a href=\"https://www.woolworths.com.au/shop/productdetails/" + (newProductArray[maxPriceIndex].productStockcode) + "\" target=\"_blank\" rel=\"noopener noreferrer\"><image src=\"" + (newProductArray[maxPriceIndex].productImageUrl)+"\" alt=\"Image of product\" class=\"previewImage\"></a>");

        let ingredientMeanPriceElement = $("<p>Mean price ($/100g): $" + (GetMeanPrice(newProductArray) * standardAmountToDisplay).toFixed(2) + "<p/>");
    
        ingredientMinPriceElement.appendTo(ingredientNameElement);
        ingredientMinPriceProductTitleElement.appendTo(ingredientNameElement);
        ingredientMinPriceProductPriceElement.appendTo(ingredientNameElement);
        ingredientMinPriceProductImageElement.appendTo(ingredientNameElement);

        ingredientMaxPriceElement.appendTo(ingredientNameElement);
        ingredientMaxPriceProductTitleElement.appendTo(ingredientNameElement);
        ingredientMaxPriceProductPriceElement.appendTo(ingredientNameElement);
        ingredientMaxPriceProductImageElement.appendTo(ingredientNameElement);

        ingredientMeanPriceElement.appendTo(ingredientNameElement);
    
        ingredientNameElement.appendTo(ingredientInformationListElement);
    }
    else NoUsableProductsWereFound(productName)
}

function GetProductArray(data)
{
    let productArray = [];

    for (let i = 0; i < data.Products.length; i++) 
    {
        if (data.Products[i].Products[0].IsAvailable)
        {
            let newProduct = Object.create(product);

            newProduct.productName = data.Products[i].DisplayName;
            newProduct.productImageUrl = data.Products[i].Products[0].DetailsImagePaths[0];
            newProduct.productStockcode = data.Products[i].Products[0].Stockcode;

            newProduct.originalSize = data.Products[i].Products[0].PackageSize;
            newProduct.originalPrice = data.Products[i].Products[0].Price;
            
            if (newProduct.originalSize != null && newProduct.originalPrice != null)
            {
                let normalisePriceSuccess = NormalisePrice(newProduct);
                if (normalisePriceSuccess) productArray.push(newProduct);
            }
            else console.log(data.Products[i].DisplayName + " was removed as either the price or size were null.");
        }
        else console.log(data.Products[i].DisplayName + " was removed as it is unavailable.");
    }

    return productArray;
}

function NormalisePrice(product)
{
    let packageSizeType = GetProductUnitType(product.originalSize);
    if (packageSizeType == null) return false;
    let productWeightNumberOnly = GetProductWeightWithoutLetters(product.originalSize, packageSizeType, product.productName);
    let productWeightInGramsOrML = ConvertWeightIntoGramsOrML(productWeightNumberOnly, packageSizeType);

    product.pricePerGramOrML = product.originalPrice / productWeightInGramsOrML;
    product.gramOrML = GramsOrML(packageSizeType);
    return true;
}

function GetProductUnitType(packageSize)
{
    let packageSizeLowercase = packageSize.toLowerCase();
    let packageSizeLettersOnly = packageSizeLowercase.replace(/[^a-z]/g, '');

    if (packageSizeLettersOnly == "each" || packageSizeLettersOnly == "ea") return "each";

    switch(packageSizeLettersOnly)
    {
        case "perkg": return "kg";
        case "kgpunnet": return "kg";
        case "kgbag": return "kg";
        case "perg": return "g";
        case "gpunnet": return "g";
        case "gbag": return "kg";
        case "permg": return "mg";
        case "perl": return "l";
        case "perml": return "ml";
        case "kg": return "kg";
        case "g": return "g";
        case "mg": return "mg";
        case "l": return "l";
        case "ml": return "ml";
        default: console.log("Unable to extract product weight unit: " + "\"" + packageSizeLettersOnly + "\"." ); return null;
    }
}

function GetProductWeightWithoutLetters(packageWeight, packageSizeType, productName)
{
    if (packageSizeType === "each") { return GetEstimatedWeightOfFruitsAndVegetables(productName); }
    else
    {
        let packageWeightLowercase = packageWeight.toLowerCase();
        if (packageWeightLowercase === "per kg") return 1;
        else if (packageWeightLowercase === "per g") return 1;
        let packageWeightNoLetters = packageWeightLowercase.replace(/[a-z]/g, '');
        return packageWeightNoLetters;
    }
}

function ConvertWeightIntoGramsOrML(weight, packageType)
{
    if (packageType === "each") return weight;
    if (packageType === "kg") return weight * 1000;
    if (packageType === "g") return weight;
    if (packageType === "mg") return weight / 1000;
    if (packageType === "l") return weight * 1000;
    if (packageType === "ml") return weight;
}

function GramsOrML(packageSizeType)
{
    if (packageSizeType === "kg" || packageSizeType === "g" || packageSizeType === "mg" || packageSizeType === "each" ) return "g";
    else return "ml";
}

function GetIndexOfMinPrice(productArray)
{
    let minIndex = 0;
    for (let i = 1; i < productArray.length; i++) 
    {
        if (productArray[i].pricePerGramOrML < productArray[minIndex].pricePerGramOrML) minIndex = i;
    }
    return minIndex;
}

function GetIndexOfMaxPrice(productArray)
{
    let maxIndex = 0;
    for (let i = 0; i < productArray.length; i++) 
    {
        if (productArray[i].pricePerGramOrML > productArray[maxIndex].pricePerGramOrML) maxIndex = i;
    }
    return maxIndex;
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
    //If plural, remove the plural
    if (nameLowercase[nameLowercase.length - 1] === "s") nameLowercase.slice(0, -1);

    for (let i = 0; i < fruitAndVegArray.length; i++) 
    {
        if (nameLowercase.includes(fruitAndVegArray[i].name)) return fruitAndVegArray[i].estimatedWeight;
    }
}

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
function FruitAndVegObject(name, estimatedWeight)
{
    this.name = name;
    this.estimatedWeight = estimatedWeight;
}

function SaveRecipe()
{

}

function DoesRecipeAlreadyExist()
{

}

function LoadRecipe()
{

}

function ProductNotFound(productName)
{
    console.log("Your search for: " + "\"" + productName + "\"" + " yielded no results, please ensure that the ingredient was spelled correctly.");
}

function NoUsableProductsWereFound(productName)
{
    console.log("We coulnd't find enough products that match the requirements for " + productName + ". We apologise for the inconvenience.");
}

Init();

$("#searchBox").bind("keyup" , IngredientEntered);