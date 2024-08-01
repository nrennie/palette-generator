library(shiny)
library(htmltools)
library(shinythemes)

# Functions ---------------------------------------------------------------

# From https://github.com/nrennie/usefunc/blob/main/R/random_hex.R
random_hex <- function(n) {
  generate_hex <- function() {
    choices <- sample(c(as.character(0:9), LETTERS[1:6]),
      size = 6, replace = TRUE
    )
    output <- paste0("#", paste0(choices, collapse = ""))
    return(output)
  }
  hex <- replicate(n = n, generate_hex(), simplify = TRUE)
  return(hex)
}

plot_hex <- function(hex, pad = 0.1) {
  n <- length(hex)
  old <- graphics::par(mar = c(0, 0, 0, 0))
  on.exit(graphics::par(old))
  # label colours
  lum_from_rgb <- function(rgb) {
    sum(c(0.2126, 0.7152, 0.0722)*rgb)
  }
  light_or_dark <- function(hex) {
    rgb <- as.data.frame(col2rgb(hex))
    lum <- apply(rgb, 2, lum_from_rgb)
    c("white", "black")[(lum > 128)+1]
  }
  # plot colours
  graphics::image(
    x = 1,
    y = 1:n,
    z = matrix(1:n, nrow = 1),
    col = rev(hex),
    ylab = "", xaxt = "n", yaxt = "n", bty = "n"
  )
  # add labels
  graphics::text(
    x = 1,
    y = 1:n,
    cex = 1.5,
    labels = rev(hex),
    col = light_or_dark(rev(hex))
  )
}


# UI ----------------------------------------------------------------------

ui <- fluidPage(
  theme = shinytheme("darkly"),
  titlePanel("Palette Generator"),
  sidebarLayout(
    sidebarPanel(
      hr(),
      # Select number of colours
      selectInput(
        inputId = "n_colours",
        label = "Number of colors:",
        choices = 1:12,
        selected = 6
      ),
      # Keep some colours
      uiOutput("keep_check"),
      # Regenerate palette
      actionButton(
        inputId = "generate",
        label = "Regenerate palette"
      ),
      width = 6
    ),
    mainPanel(
      plotOutput("plot_palette"),
      br(),
      markdown("Use this palette in R:"),
      verbatimTextOutput("r_palette"),
      markdown("Use this palette in Python:"),
      verbatimTextOutput("py_palette"),
      br(),
      width = 6
    )
  )
)


# Server ------------------------------------------------------------------

server <- function(input, output) {
  # Generate palette
  num_generate <- eventReactive(
    c(input$n_colours, input$keep_colours, input$generate),
    {
      num_cols <- as.numeric(input$n_colours) - length(input$keep_colours)
    }
  )

  # Generate palette
  palette <- eventReactive(
    c(input$n_colours, input$generate),
    {
      c(input$keep_colours, random_hex(n = num_generate()))
    }
  )

  # Colours to keep
  output$keep_check <- renderUI({
    checkboxGroupInput(
      inputId = "keep_colours",
      label = "Colours to keep:",
      choices = palette(),
      selected = input$keep_colours
    )
  })

  # Plot palette
  output$plot_palette <- renderPlot({
    plot_hex(palette())
  })

  # Vector of palettes in R
  output$r_palette <- renderPrint({
    cat(paste0(
      "c(",
      paste0(
        paste0("'", palette(), "'"),
        collapse = ", "
      ), ")"
    ))
  })

  # Vector of palettes in Python
  output$py_palette <- renderPrint({
    cat(paste0(
      "[",
      paste0(
        paste0("'", palette(), "'"),
        collapse = ", "
      ), "]"
    ))
  })
}

shinyApp(ui = ui, server = server)
