package entity

type Entity interface {
	GetId() int
	GetName() string
	GetInfo() string
	GetValidation() string
	SetName(string)
	SetInfo(string)
	SetValidation(string)
	GetCamps() []string
	GetData() []interface{}
}
