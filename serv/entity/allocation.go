package entity

type Allocation struct {
	Id         int `json:"id"`
	ItemId     int `json:"item_id"`
	LocationId int `json:"location_id"`
	UserId     int `json:"user_id"`
}

func (a *Allocation) GetId() int {
	return a.Id
}

func (a *Allocation) SetId(id int) {
	a.Id = id
}

func (a *Allocation) GetCamps() []string {
	return []string{"allocation", "id", "item_sku", "location_id", "user_id"}
}

func (a *Allocation) GetData() []any {
	return []any{&a.Id, &a.ItemId, &a.LocationId, &a.UserId}
}

func (a *Allocation) GetPath() string {
	return "allocation"
}

func (a *Allocation) Validate() {
	if a.ItemId == 0 {
		panic("Item is required")
	}
	if a.LocationId == 0 {
		panic("Location is required")
	}
	if a.UserId == 0 {
		panic("Used is required")
	}
}

func (a *Allocation) ValidateUpdate() {
}

func (a *Allocation) New() Entity {
	return &Allocation{}
}
