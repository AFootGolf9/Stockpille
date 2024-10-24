package service

import (
	"stockpille/entity"
	"stockpille/repository/entityRepository"
)

func New(entity entity.Entity) {
	entity.Validate()
	err := entityRepository.Insert(entity)

	if err != nil {
		panic(err)
	}
}

func Get(entity entity.Entity) (entity.Entity, error) {
	err := entityRepository.SelectPK(entity)
	return entity, err
}

func GetAll(entity entity.Entity) []entity.Entity {
	entities, err := entityRepository.SelectAll(entity)

	if err != nil {
		panic(err)
	}

	return entities
}

func Update(entity entity.Entity) {
	entity.ValidateUpdate()
	err := entityRepository.Update(entity)
	if err != nil {
		panic(err)
	}
}

func Delete(entity entity.Entity) {
	err := entityRepository.Delete(entity)
	if err != nil {
		panic(err)
	}
}
