package service

// import (
// 	"stockpille/entity"
// 	"stockpille/repository/entityRepository"
// )

// func New(entity entity.Entity) {
// 	entity.Validate()
// 	err := entityRepository.Insert(entity)

// 	if err != nil {
// 		panic(err)
// 	}
// }

// func Get(entity entity.Entity) (entity.Entity, error) {
// 	err := entityRepository.SelectPK(entity)
// 	entity.HideSecret()
// 	return entity, err
// }

// func GetAll(entity entity.Entity) []entity.Entity {
// 	entities, err := entityRepository.SelectAll(entity)

// 	if err != nil {
// 		panic(err)
// 	}

// 	for _, entity := range entities {
// 		entity.HideSecret()
// 	}

// 	return entities
// }

// func GetWithPagination(entity entity.Entity, page int, size int) []entity.Entity {
// 	entities, err := entityRepository.SelectWithPagination(entity, page, size)

// 	if err != nil {
// 		panic(err)
// 	}

// 	for _, entity := range entities {
// 		entity.HideSecret()
// 	}

// 	return entities
// }

// func Update(entity entity.Entity) {
// 	entity.ValidateUpdate()
// 	err := entityRepository.Update(entity)
// 	if err != nil {
// 		panic(err)
// 	}
// }

// func Delete(entity entity.Entity) {
// 	err := entityRepository.Delete(entity)
// 	if err != nil {
// 		panic(err)
// 	}
// }
