package entity

import (
	"stockpille/repository"
	"strings"
)

type Role struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

func (r *Role) GetId() int {
	return r.Id
}

func (r *Role) SetId(id int) {
	r.Id = id
}

func (r *Role) GetCamps() []string {
	return []string{"role", "id", "name"}
}

func (r *Role) GetData() []any {
	return []any{&r.Id, &r.Name}
}

func (r *Role) GetPath() string {
	return "role"
}

func (r *Role) IsPersisted() bool {
	return true
}

func (r *Role) Validate(id int) {
	if r.Name == "" {
		panic("Name is required")
	}

	r.Name = strings.ToUpper(r.Name)
}

func (r *Role) ValidateUpdate() {
	camps := []string{"role", "id"}
	data := []any{&r.Id}
	if r.Name != "" {
		r.Name = strings.ToUpper(r.Name)
	} else {
		camps = append(camps, "name")
		data = append(data, &r.Name)
	}

	err := repository.PrepareForUpdate(camps, data)

	if err != nil {
		panic(err)
	}
}

func (r *Role) HideSecret() {
}

func (r *Role) New() Entity {
	return &Role{}
}
