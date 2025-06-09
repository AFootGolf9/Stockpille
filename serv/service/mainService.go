package service

import (
	"stockpille/entity"
	"stockpille/repository/entityRepository"
)

func New(object entity.Entity, userId int) {
	object.Validate(userId)
	err := entityRepository.Insert(object)

	if err != nil {
		panic(err)
	}
}

func Get(object entity.Entity, allowed string, userId int) (entity.Entity, error) {
	var err error
	if allowed == "self" {
		err = entityRepository.SelfSelectPK(object, userId)
	}
	if allowed == "all" {
		err = entityRepository.SelectPK(object)
	}
	object.HideSecret()
	return object, err
}

func GetAll(object entity.Entity) []entity.Entity {
	objects, err := entityRepository.SelectAll(object)

	if err != nil {
		panic(err)
	}

	for _, object := range objects {
		object.HideSecret()
	}

	return objects
}

func GetWithPagination(object entity.Entity, page int, size int, allowed string, userId int) []entity.Entity {

	objects := []entity.Entity{}
	var err error
	if allowed == "self" {
		objects, err = entityRepository.SelectWithPaginationAndUser(object, page, size, userId)
	}
	if allowed == "all" {
		objects, err = entityRepository.SelectWithPagination(object, page, size)
	}

	if err != nil {
		panic(err)
	}

	for _, object := range objects {
		object.HideSecret()
	}

	return objects
}

func Update(object entity.Entity, allowed string, userId int) {
	var err error
	object.ValidateUpdate()
	if allowed == "self" {
		err = entityRepository.SelfUpdate(object, userId)
	}
	if allowed == "all" {
		err = entityRepository.Update(object)
	}

	if err != nil {
		panic(err)
	}
}

func Delete(object entity.Entity, allowed string, userId int) {
	var err error
	if allowed == "self" {
		err = entityRepository.SelfUpdate(object, userId)
	}
	if allowed == "all" {
		err = entityRepository.Delete(object)
	}

	if err != nil {
		panic(err)
	}
}
