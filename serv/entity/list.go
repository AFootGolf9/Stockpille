package entity

var (
	// one list with all the entities
	Entities = []Entity{
		&Allocation{},
		&Item{},
		&Location{},
		&Role{},
		&User{},
	}
)
