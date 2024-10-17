package service

import (
	"stockpille/entity"
	"stockpille/repository"
)

func NewItem(item entity.Item) {
	repository.Insert(&item)
}

func GetItemById(id int) entity.Item {
	item := entity.Item{Sku: id}
	err := repository.SelectPK(&item)
	if err != nil {
		panic(err)
	}
	return item
}

func GetAllItems() []entity.Item {
	return repository.GetAllItems()
}
