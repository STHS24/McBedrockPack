# --- FASE 1 (De 1 tick até 1 Dia) ---
# Ativa a Fase 1 imediatamente após o roubo (maior que 0) e desliga se o tempo passar de 1 dia
execute if score t1 pvp_timer matches 1..1728000 run execute as @a[tag=t1] run function t1F1

# --- FASE 2 (Após 1 Dia até 8 Dias cumulativos) ---
# 1 Dia (1.728.000) + 7 Dias (12.096.000) = 13.824.000 ticks no total
execute if score t1 pvp_timer matches 1728001..13824000 run execute as @a[tag=t1] run function t1F2

# --- FASE 3 (Após os 7 dias da Fase 2, ou seja, após 8 dias totais) ---
# Ativa a Fase 3 permanentemente a partir do tick 13.824.001
execute if score t1 pvp_timer matches 13824001.. run execute as @a[tag=t1] run function t1F3
