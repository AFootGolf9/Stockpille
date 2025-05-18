package entity

type Entity interface {
	GetId() int
	SetId(int)
	GetCamps() []string
	GetData() []interface{}
	GetPath() string
	IsPersisted() bool
	Validate(id int)
	ValidateUpdate()
	HideSecret()
	New() Entity
}
