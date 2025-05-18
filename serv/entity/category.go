package entity

import (
	"stockpille/repository"
	"strings"
)

type Category struct {
	Id     int    `json:"id"`
	Name   string `json:"name"`
	UserId int    `json:"user_id"`
}

func (c *Category) GetId() int {
	return c.Id
}

func (c *Category) SetId(id int) {
	c.Id = id
}

func (c *Category) GetCamps() []string {
	return []string{"category", "id", "name", "user_id"}
}

func (c *Category) GetPath() string {
	return "category"
}

func (c *Category) GetData() []any {
	return []any{&c.Id, &c.Name, &c.UserId}
}

func (c *Category) IsPersisted() bool {
	return true
}

func (c *Category) Validate(id int) {
	if c.Name == "" {
		panic("Name is required")
	}

	c.UserId = id

	c.Name = strings.ToUpper(c.Name)
}

func (c *Category) ValidateUpdate() {
	camps := []string{"category", "id"}
	data := []any{&c.Id}
	if c.Name != "" {
		c.Name = strings.ToUpper(c.Name)
	} else {
		camps = append(camps, "name")
		data = append(data, &c.Name)
	}

	err := repository.PrepareForUpdate(camps, data)

	if err != nil {
		panic(err)
	}
}

func (c *Category) HideSecret() {
	// No secret to hide
}

func (c *Category) New() Entity {
	return &Category{}
}
