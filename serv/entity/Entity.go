package entity

type Entity interface {
	GetId() int
	SetId(int)
	GetCamps() []string
	GetData() []interface{}
	GetPath() string
	Validate()
	ValidateUpdate()
	New() Entity
}
