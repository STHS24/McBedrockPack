# ========================================================
# INVISIBILIDADE AUTOMÁTICA DOS SUPORTES
# ========================================================
effect @e[type=armor_stand,name="banner_purple",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] invisibility 99999 0 true


# ========================================================
# MONITORAMENTO DE ROUBO / RECUPERAÇÃO
# ========================================================

# --- TIME ROXO ---
execute unless entity @e[type=armor_stand,name="banner_purple",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] run execute as @a[tag=team_purple] run function t1F1
execute if entity @e[type=armor_stand,name="banner_purple",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] run execute as @a[tag=team_purple] run function t1Off
