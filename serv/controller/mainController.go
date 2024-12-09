package controller

import (
	"stockpille/entity"
	"stockpille/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

func MakeController(entity entity.Entity, rest Rest) func(c *gin.Context) {
	return func(c *gin.Context) {
		switch rest {
		case GET:
			getController(entity, c)
		case GETALL:
			getAllController(entity, c)
		case POST:
			postController(entity, c)
		case PUT:
			putController(entity, c)
		case DELETE:
			deleteController(entity, c)
		}
	}
}

func getController(entity entity.Entity, c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid ID",
		})
	}

	entity.SetId(id)

	entity, err = service.Get(entity)

	if err != nil {
		c.JSON(404, gin.H{
			"error": "Item not found",
		})
		return
	}
	c.JSON(200, gin.H{
		"data": entity,
	})
}

func getAllController(entity entity.Entity, c *gin.Context) {
	c.JSON(200, gin.H{
		"data": service.GetAll(entity),
	})
}

func postController(entity entity.Entity, c *gin.Context) {
	c.BindJSON(&entity)
	service.New(entity)
	c.JSON(200, gin.H{
		"status": "Entry created, lad",
	})
}

func putController(entity entity.Entity, c *gin.Context) {
	c.BindJSON(&entity)

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		println(err.Error())
		c.JSON(400, gin.H{
			"error": "Invalid ID",
		})
	}

	entity.SetId(id)

	service.Update(entity)
	c.JSON(200, gin.H{
		"status": "Entry updated, lad",
	})
}

func deleteController(entity entity.Entity, c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid ID",
		})
	}

	entity.SetId(id)

	service.Delete(entity)
	c.JSON(200, gin.H{
		"status": "Entry deleted, lad",
	})
}
