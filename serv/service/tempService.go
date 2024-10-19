package service

import (
	"stockpille/entity"
	"stockpille/repository"
)

func New(entity entity.Entity) {
	entity.Validate()
	err := repository.Insert(entity)

	if err != nil {
		panic(err)
	}
}

func Get(entity entity.Entity) (entity.Entity, error) {
	err := repository.SelectPK(entity)
	return entity, err
}

func GetAll(entity entity.Entity) []entity.Entity {
	entities, err := repository.SelectAll(entity)

	if err != nil {
		panic(err)
	}

	return entities
}

func Update(entity entity.Entity) {
	entity.ValidateUpdate()
	err := repository.Update(entity)
	if err != nil {
		panic(err)
	}
}

func Delete(entity entity.Entity) {
	err := repository.Delete(entity)
	if err != nil {
		panic(err)
	}
}
