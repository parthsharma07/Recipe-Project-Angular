import { Recipe } from './recipe.model';
import { Injectable } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { Subject } from 'rxjs';

@Injectable()
export class RecipeService{
    recipesChanged = new Subject<Recipe[]>();

    private recipes: Recipe[] = [
        new Recipe('its test',
         'parth is testing',
          'https://www.acouplecooks.com/wp-content/uploads/2019/01/Crispy-Cauliflower-Tacos-038.jpg', 
          [
              new Ingredient('Potatoes',1),
              new Ingredient('French Fries',20)
          ]),
        new Recipe('its test two',
         'parth has tested',
          'https://www.acouplecooks.com/wp-content/uploads/2019/01/Crispy-Cauliflower-Tacos-038.jpg', 
          [
              new Ingredient('Buns',2),
              new Ingredient('Potatoes',1)
          ])
      ];

    constructor(private slService: ShoppingListService) {}  

    getRecipes(){
        return this.recipes.slice();
    }

    getRecipe(index: number){
        return this.recipes[index];
    }

    addRecipe(recipe: Recipe){
        this.recipes.push(recipe);
        this.recipesChanged.next(this.recipes.slice());
    }

    updateRecipe(index: number, newRecipe: Recipe){
        this.recipes[index] = newRecipe;
        this.recipesChanged.next(this.recipes.slice());
    }

    deleteRecipe(index: number){
        this.recipes.splice(index,1);
        this.recipesChanged.next(this.recipes.slice());
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]){
        this.slService.addIngredients(ingredients);
    }
}