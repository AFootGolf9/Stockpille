package routes

import (
	"stockpille/controller"
	"stockpille/entity"

	"github.com/gin-gonic/gin"
)

type RouteSeter struct {
	Router *gin.Engine
}

func (rs *RouteSeter) SetCRUD(entity entity.Entity) {
	rs.Router.GET(entity.GetPath()+"/:id", controller.MakeController(entity, controller.GET))

	// example.com/entity?page=1&size=10
	rs.Router.GET(entity.GetPath(), controller.MakeController(entity, controller.GETALL))
	rs.Router.POST(entity.GetPath(), controller.MakeController(entity, controller.POST))
	rs.Router.PUT(entity.GetPath()+"/:id", controller.MakeController(entity, controller.PUT))
	rs.Router.DELETE(entity.GetPath()+"/:id", controller.MakeController(entity, controller.DELETE))
}
