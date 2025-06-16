package entity

import (
	"errors"
	"stockpille/repository"
	"strings"
)

type Location struct {
	Id     int    `json:"id"`
	Name   string `json:"name"`
	UserId int    `json:"user_id"`
}

func (l *Location) GetId() int {
	return l.Id
}

func (l *Location) SetId(id int) {
	l.Id = id
}

func (l *Location) GetCamps() []string {
	return []string{"location", "id", "name", "user_id"}
}

func (l *Location) GetData() []interface{} {
	return []interface{}{&l.Id, &l.Name, &l.UserId}
}

func (l *Location) GetPath() string {
	return "location"
}

func (l *Location) IsPersisted() bool {
	return true
}

func (l *Location) Validate(id int) error {
	if l.Name == "" {
		return errors.New("name is required")
	}

	l.UserId = id
	l.Name = strings.ToUpper(l.Name)

	return nil
}

func (l *Location) ValidateUpdate() {
	camps := []string{"location", "id"}
	data := []interface{}{&l.Id}
	if l.Name != "" {
		l.Name = strings.ToUpper(l.Name)
	} else {
		camps = append(camps, "name")
		data = append(data, &l.Name)
	}

	err := repository.PrepareForUpdate(camps, data)

	if err != nil {
		panic(err)
	}
}

func (l *Location) HideSecret() {
}

func (l *Location) New() Entity {
	return &Location{}
}
