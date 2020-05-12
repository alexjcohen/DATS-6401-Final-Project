# load libraries and set filepath
library(data.table)
library(dplyr)
library(stringr)
library(readxl)
library(magrittr)
library(reshape2)
library(jsonlite)

filepath <- "C:/wamp64/www/final_project/data2/"

##### Housing Prices ######
# list all files in the directory
files <- list.files(paste0(filepath, "Housing Prices/"))
files %<>% str_replace_all(".xls", "")

house_data <- data.frame()

# read files
for(i in files){
  assign("x", read_excel(list.files(paste0(filepath, "Housing Prices/"), 
                                    pattern = eval(i), full.names = TRUE), sheet = "All Homes",  
                         col_types = "text"))
  
  # reset names to be dates to time series analysis
  names(x)[-c(1:3)] %<>% as.numeric() %>% as.Date(origin = "1899-12-31") %>% as.character()
  
  setDT(x)
  
  # drop specific columns and rename the city variable
  x <- x[, -c(4:19)]
  x <- x[`Region Type` == "city"] %>% mutate(city = eval(i))
  
  house_data %<>% rbind(x)
  
}

# filter variables to 2010-2017
house_data %<>% select(-c(grep("2018-", names(house_data)), grep("2019-", names(house_data))))

# update variable names
names(house_data) %<>% str_replace_all("-16", "")
names(house_data) <- paste0("price_", names(house_data))
names(house_data)[1] <- "city"

# correct St. Louis due to differing spellings
house_data$city[house_data$city == "Saint Louis"] <- "St. Louis"

##### Apartment Prices ######
# list all files in folder
files <- list.files(paste0(filepath, "Rent Prices/"))
files %<>% str_replace_all(".xls", "")

rent_data <- data.frame()

for(i in files){
  # read in a specific file
  assign("x", read_excel(list.files(paste0(filepath, "Rent Prices/"), 
                                    pattern = eval(i), full.names = TRUE), sheet = "All Homes",  
                         col_types = "text"))
  
  # reset strings to date objects
  names(x)[-c(1:3)] %<>% as.numeric() %>% as.Date(origin = "1899-12-31") %>% as.character()
  
  setDT(x)
  
  # correct city variable and append to data frame
  x <- x[`Region Type` == "city"] %>% mutate(city = eval(i)) 
  rent_data %<>% rbind(x)
  
}

# subset to 2010-2017 data
rent_data %<>% select(-c(grep("2018-", names(rent_data)), grep("2019-", names(rent_data))))

# correct variable names
names(rent_data) %<>% str_replace_all("-16", "")
names(rent_data) <- paste0("rent_", names(rent_data))
names(rent_data)[1] <- "city"

# correct St. Louis due to differing spelling
rent_data$city[rent_data$city == "Saint Louis"] <- "St. Louis"

##### population ######

# list all files in folder
files <- list.files(paste0(filepath, "Population/"))
files %<>% str_replace_all(".csv", "")

# loop through files
for(i in files) {

  # read spreadsheet and asign it ot object
  assign(eval(i), fread(list.files(paste0(filepath, "Population/"), 
                                   pattern = eval(i), full.names = TRUE)))
}

# filter state-by-state to only relevant cities and select relevant columns
ny_pop %<>% filter(NAME == "New York city") %>% 
  select(NAME, grep('POPESTIMATE', names(ny_pop)))
ga_pop %<>% filter(NAME == "Atlanta city") %>% 
  select(NAME, grep('POPESTIMATE', names(ga_pop)))
ca_pop %<>% filter(NAME %in% c("San Francisco city", "Los Angeles city")) %>% 
  select(NAME, grep('POPESTIMATE', names(ca_pop))) %>% unique()
dc_pop %<>% filter(NAME == "Washington city") %>% 
  select(NAME, grep('POPESTIMATE', names(dc_pop))) %>% unique()
il_pop %<>% filter(NAME == "Chicago city") %>% 
  select(NAME, grep('POPESTIMATE', names(il_pop))) %>% unique() %>% slice(1)
ma_pop %<>% filter(NAME == "Boston city") %>% 
  select(NAME, grep('POPESTIMATE', names(ma_pop))) %>% unique()
wa_pop %<>% filter(NAME == "Seattle city") %>% 
  select(NAME, grep('POPESTIMATE', names(wa_pop))) %>% unique()
az_pop %<>% filter(NAME == "Phoenix city") %>% 
  select(NAME, grep('POPESTIMATE', names(az_pop))) %>% unique()
pa_pop %<>% filter(NAME == "Philadelphia city") %>% 
  select(NAME, grep('POPESTIMATE', names(pa_pop))) %>% unique() %>% slice(1)
nc_pop %<>% filter(NAME == "Charlotte city") %>% 
  select(NAME, grep('POPESTIMATE', names(nc_pop))) %>% unique() 
tx_pop %<>% filter(NAME == "Houston city") %>% 
  select(NAME, grep('POPESTIMATE', names(tx_pop))) %>% unique() 
co_pop %<>% filter(NAME == "Denver city") %>% 
  select(NAME, grep('POPESTIMATE', names(co_pop))) %>% unique() 
fl_pop %<>% filter(NAME == "Miami city") %>% 
  select(NAME, grep('POPESTIMATE', names(fl_pop))) %>% unique() 
mo_pop %<>% filter(NAME == "St. Louis city") %>% 
  select(NAME, grep('POPESTIMATE', names(mo_pop))) %>% unique() 

# loop through files and bind to common data frame
pop_data <- data.frame()
for(i in files){
  pop_data <- rbind(pop_data, get(i)) 
}

# update variable names
pop_data$NAME %<>% str_replace_all(" city", "")
names(pop_data)[1] <- "city"

##### get first dataset #####

# join housing, rent, and population datasets
data <- inner_join(house_data, rent_data, "city") %>% inner_join(pop_data, "city")

# update and filter variable names
names(data) %<>% str_replace_all(" ", "_")
data %<>% select(-price_city, -rent_city, -rent_Region_Type, -rent_Data_Type, -price_Region_Type, 
                 -price_Data_Type)

# define region variable and append
regions <- c("South", "East", "South", "Central", 
             "Central", "South", "West", "East", 
             "East", "East", "West", "West", "West", "Central", "East")
data$region <- regions


##### Income ######

# loop through spreadsheets and assign to objects
for(i in 10:17){
  assign(paste0("income_", i), 
         fread(list.files(paste0(filepath, "Income/"), 
                          pattern = paste0(i, "_1YR_S1903_with_ann"), full.names = TRUE)))
}

# find all income-related objects
tables <- ls(pattern = "income")

# loop through each income year and subset to specific columns
for(i in tables){
  x <- get(i)
  names(x) <- as.character(x[1,])
  x <- x[-1,]
  x %<>% select(Geography, `Median income (dollars); Estimate; Households`) %>% 
    mutate(year = as.numeric(paste0("20", str_sub(i, 8,9))))
  assign(eval(i), x)
  rm(x)
}

# bind all individual data frames to common data frame
income <- income_10
for (i in tables[-1]){
  income <- rbind(income, get(i))
}

# update variable name
names(income)[2] <- "Median_income"

# split geography to keep city name
income$Geography <- str_sub(income$Geography, 1, (str_locate(income$Geography, "city")[,1])-2)

# melt value to create lollipop charts
income %<>% dcast(Geography ~ year, value.var = "Median_income")
names(income)[-1] <- paste0("income_", names(income)[-1])

##### get income dataset #####

# subset housing and apartment datasets and join income dataset
house_data %<>% select(-price_city, -`price_Region Type`, -`price_Data Type`)
rent_data %<>% select(-rent_city, -`rent_Region Type`, -`rent_Data Type`)

income %<>% left_join(house_data, c("Geography" = "city")) %>% 
  left_join(rent_data, c("Geography" = "city"))

# append regions and reorder
income$region <- regions
income %<>% select(Geography, region, everything())

##### age and sex figures #####

# repeat reading, assigning, and cleaning process for age dataset
for(i in 10:17){
  assign(paste0("age_", i), 
         fread(list.files(paste0(filepath, "Age and Sex/"), 
                          pattern = paste0(i, "_1YR_S0101_with_ann"), full.names = TRUE)))
}

tables <- ls(pattern = "age")

for(i in tables){
  x <- get(i)
  names(x) <- as.character(x[1,])
  x <- x[-1,]
  if(i != "age_17") {
    x %<>% select(c("Geography", grep("Total; Estimate; AGE", names(x), value = T)[1:17],
                    "Total; Estimate; SUMMARY INDICATORS - Median age (years)")) %>% 
      mutate(year = as.numeric(paste0("20", str_sub(i, 5,6))))
  }
  else {
    x %<>% select(c("Geography", grep("Percent; Estimate; AGE", names(x), value = T)[1:17], 
                    "Total; Estimate; SUMMARY INDICATORS - Median age (years)")) %>% 
      mutate(year = as.numeric(paste0("20", str_sub(i, 5,6))))
    
  }
  
  assign(eval(i), x)
  rm(x)
}


# create binned age dataset for heatmap
for(i in tables){
  x <- get(i)
  for (j in 2:ncol(x)){
    x[, j] %<>% as.numeric()
  }
  
  # combine columns to create larger age ranges
  x %<>% mutate("0 to 14" = x[, 2] + x[, 3] + x[, 4], 
                "15 to 24" = x[, 5] + x[, 6],
                "25 to 40" = x[, 7] + x[, 8] + x[, 9], 
                "40 to 65" = x[, 10] + x[, 11] + x[, 12] + x[, 13] + x[, 14],
                "65+" = x[, 15] + x[, 16] + x[, 17] + x[, 18]) 
  
  # subset values and split city geography
  x %<>% select(Geography, c(21:25))
  x %<>% mutate(Geography = str_sub(Geography, 1, (str_locate(Geography, "city")[,1])-2))
  x %<>% arrange(Geography)
  
  # melt to create long dataset
  x %<>% melt() %>% mutate(datayear = paste0("20", str_sub(i, 5, 6)))
  
  # turn values to percentages
  x[,3] %<>% as.numeric()
  x[, 3] <- x[, 3]/100
  assign(paste0(eval(i), "_binned"), x)
}

# bind binned ages
age_binned <- age_10_binned %>% rbind(age_11_binned) %>% 
                                rbind(age_12_binned) %>%
                                rbind(age_13_binned) %>%
                                rbind(age_14_binned) %>% 
                                rbind(age_15_binned) %>%
                                rbind(age_16_binned) %>%    
                                rbind(age_17_binned)

# create mdeian age dataset
age <- data.frame()
for(i in tables){
  x <- get(i)
  names(x)[19] <- "median_age"
  x %<>% select(Geography, median_age, year)
  assign(eval(i), x)
  age <- rbind(age, x)
}

# split geography, melt, and rename
age$Geography <- str_sub(age$Geography, 1, (str_locate(age$Geography, "city")[,1])-2)
age %<>% dcast(Geography ~ year, value.var = "median_age")
names(age)[-1] <- paste0("age_", names(age)[-1])

# create age dataset
age %<>% inner_join(house_data, c("Geography" = "city")) %>% 
         inner_join(rent_data,c("Geography" = "city") )

# append region and drop specific columns; reorder columns
age$region <- regions
names(age) %<>% str_replace_all(" ", "_")
age %<>% select(-price_city, -rent_city, -rent_Region_Type, -rent_Data_Type, -price_Region_Type, 
                 -price_Data_Type)
age %<>% select(Geography, region, everything())

##### Education #####

# repeat file reading and asignment
for(i in 10:17){
  assign(paste0("edu_", i), 
         fread(list.files(paste0(filepath, "Education/"), 
                          pattern = paste0(i, "_1YR_S1501_with_ann"), full.names = TRUE)))
}

tables <- ls(pattern = "edu")

for(i in tables){
  x <- get(i)
  names(x) <- as.character(x[1,])
  x <- x[-1,]
  setDT(x)
  
  if(i %in% c("edu_10", "edu_11", "edu_12", "edu_13", "edu_14")) {
    
    col1 <- grep("Geography", names(x))
    col2 <- grep("Total; Estimate; Percent high school graduate or higher", names(x))
    col3 <- grep("Total; Estimate; Percent bachelor's degree or higher", names(x))
    
    cols <- c(col1, col2, col3)
    
    x <- x[, ..cols]
    
    x  %<>% mutate(year = as.numeric(paste0("20", str_sub(i, 5,6))))
  } else {
    x %<>% select(c("Geography",
                    "Percent; Estimate; Percent high school graduate or higher",
                    "Percent; Estimate; Percent bachelor's degree or higher")) %>% 
      mutate(year = as.numeric(paste0("20", str_sub(i, 5,6))))
    
  }
  names(x)[2:3] <- c("percent_hs_or_higher", "percent_bachelors_or_high")
  assign(eval(i), x)
  rm(x)
}

# create HS dataset
high_school <- data.frame()
for(i in tables){
  x <- get(i)
  x %<>% select(Geography, percent_hs_or_higher, year)
  names(x)[2] <- "percent_hs"
  high_school <- rbind(high_school, x)
}

# create College dataset
college <- data.frame()
for(i in tables){
  x <- get(i)
  x %<>% select(Geography, percent_bachelors_or_high , year)
  names(x)[2] <- "percent_college"
  college <- rbind(college, x)
}

# split, melt and update names of HS dataset 
high_school$Geography <- str_sub(high_school$Geography, 1, (str_locate(high_school$Geography, "city")[,1])-2)
high_school %<>% dcast(Geography ~ year, value.var = "percent_hs")
names(high_school)[-1] <- paste0("hs_", names(high_school)[-1])

# split, melt and update names of College dataset 
college$Geography <- str_sub(college$Geography, 1, (str_locate(college$Geography, "city")[,1])-2)
college %<>% dcast(Geography ~ year, value.var = "percent_college")
names(college)[-1] <- paste0("college_", names(college)[-1])

# create datasets for stacked bar chart
dual_rates <- inner_join(high_school, college)
for(i in names(dual_rates)[-1]){
  dual_rates[, i] %<>% as.numeric()
  dual_rates[, i] <- dual_rates[, i]/100
}

# create HS rent/housing dataset
high_school %<>% inner_join(house_data, c("Geography" = "city")) %>% inner_join(rent_data, c("Geography" = "city")) 

high_school$region <- regions
high_school %<>% select(Geography, region, everything())


# create college rent/housing dataset
college %<>% inner_join(house_data, c("Geography" = "city")) %>% inner_join(rent_data, c("Geography" = "city"))

college$region <- regions
college %<>% select(Geography, region, everything())

# create overall EDU dateset
edu_data <- high_school %>% select(Geography, grep("hs_", names(high_school))) %>% inner_join(college, "Geography") %>% select(Geography, region, everything())

for(i in 3:18){
  edu_data[, i] %<>% as.numeric()
  edu_data[, i] <- edu_data[, i]/100
}

####### Employment ######

# repeat for employment
for(i in 10:17){
  assign(paste0("employ_", i), 
         fread(list.files(paste0(filepath, "Employment/"), 
                          pattern = paste0(i, "_1YR_S2301_with_ann"), full.names = TRUE)))
}

tables <- ls(pattern = "employ")

for(i in tables){
  x <- get(i)
  names(x) <- as.character(x[1,])
  x <- x[-1,]
  setDT(x)
  x %<>% select(Geography, "Unemployment rate; Estimate; Population 16 years and over") %>% 
  mutate(year = as.numeric(paste0("20", str_sub(i, 8,9))))
  names(x)[2] <- "Unemployment"
  assign(eval(i), x)
  rm(x)
}

employ <- employ_10
for (i in tables[-1]){
  employ <- rbind(employ, get(i))
}

employ$Geography <- str_sub(employ$Geography, 1, (str_locate(employ$Geography, "city")[,1])-2)
employ$Unemployment %<>% as.numeric()
employ$Unemployment <- employ$Unemployment/100
employ %<>% dcast(Geography ~ year, value.var = "Unemployment")
names(employ)[-1] <- paste0("employ_", names(employ)[-1])

regions <- c("South", "East", "South", "Central", 
             "Central", "South", "West", "East", 
             "East", "East", "West", "West", "West", "Central", "East")
employ$region <- regions

employ %<>% inner_join(house_data, c("Geography" = "city")) %>% inner_join(rent_data, c("Geography" = "city")) 

names(employ) %<>% str_replace_all(" ", "_")
employ %<>% select(-price_city, -rent_city, -rent_Region_Type, -rent_Data_Type, -price_Region_Type, 
       -price_Data_Type)

employ %<>% select(Geography, region, everything())
