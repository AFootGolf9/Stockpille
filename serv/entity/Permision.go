package entity

type Permission struct {
	RoleId     int    `json:"role_id"`
	Permission string `json:"Permission"`
	Table      string `json:"table"`
}

func (p *Permission) GetId() int {
	return p.RoleId
}

func (p *Permission) SetId(id int) {
	p.RoleId = id
}

func (p *Permission) GetCamps() []string {
	return []string{"role_permission", "role_id", "permission", "table_name"}
}

func (p *Permission) GetData() []interface{} {
	return []interface{}{p.RoleId, p.Permission, p.Table}
}

func (p *Permission) GetPath() string {
	return "permission"
}

func (p *Permission) IsPersisted() bool {
	return true
}

func (p *Permission) Validate(id int) {
}

func (p *Permission) ValidateUpdate() {
}

func (p *Permission) HideSecret() {
}

func (p *Permission) New() Entity {
	return &Permission{}
}
