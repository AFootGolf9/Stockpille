package entity

import (
	"stockpille/repository"
	"strings"
)

type Item struct {
	Sku         int    `json:"sku"`
	Name        string `json:"name"`
	Description string `json:"description"`
	CategoryId  int    `json:"category_id"`
	UserId      int    `json:"user_id"`
}

func (i *Item) GetId() int {
	return i.Sku
}

func (i *Item) SetId(id int) {
	i.Sku = id
}

func (i *Item) GetCamps() []string {
	return []string{"item", "sku", "name", "description", "category_id", "user_id"}
}

func (i *Item) GetData() []any {
	return []any{&i.Sku, &i.Name, &i.Description, &i.CategoryId, &i.UserId}
}

func (i *Item) GetPath() string {
	return "item"
}

func (i *Item) IsPersisted() bool {
	return true
}

func (i *Item) Validate(id int) {
	if i.Name == "" {
		panic("Name is required")
	}

	i.UserId = id

	categoryValid := repository.VeryfyCategory(i.CategoryId)

	if !categoryValid {
		i.CategoryId = 1
	}

	i.Name = strings.ToUpper(i.Name)
	i.Description = strings.ToUpper(i.Description)
}

func (i *Item) ValidateUpdate() {
	camps := []string{"item", "sku"}
	data := []any{&i.Sku}
	if i.Name != "" {
		i.Name = strings.ToUpper(i.Name)
	} else {
		camps = append(camps, "name")
		data = append(data, &i.Name)
	}
	if i.Description != "" {
		i.Description = strings.ToUpper(i.Description)
	} else {
		camps = append(camps, "description")
		data = append(data, &i.Description)
	}

	err := repository.PrepareForUpdate(camps, data)

	if err != nil {
		panic(err)
	}
}

func (i *Item) HideSecret() {
}

func (i *Item) New() Entity {
	return &Item{}
}
