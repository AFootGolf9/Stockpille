package entity

type Entity interface {
	GetId() int
	SetId(int)
	GetCamps() []string
	GetData() []interface{}
	GetPath() string
	IsPersisted() bool
	Validate()
	ValidateUpdate()
	HideSecret()
	New() Entity
}
