package entity

import "strings"

type Location struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

func (l *Location) GetId() int {
	return l.Id
}

func (l *Location) SetId(id int) {
	l.Id = id
}

func (l *Location) GetCamps() []string {
	return []string{"location", "id", "name"}
}

func (l *Location) GetData() []interface{} {
	return []interface{}{&l.Id, &l.Name}
}

func (l *Location) GetPath() string {
	return "location"
}

func (l *Location) IsPersisted() bool {
	return true
}

func (l *Location) Validate() {
	if l.Name == "" {
		panic("Name is required")
	}
	l.Name = strings.ToUpper(l.Name)
}

func (l *Location) ValidateUpdate() {
	l.Name = strings.ToUpper(l.Name)
}

func (l *Location) HideSecret() {
}

func (l *Location) New() Entity {
	return &Location{}
}
