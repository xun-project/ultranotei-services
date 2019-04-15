# Conceal Services
Conceal services offered through a simple API. 

Currently there are 3 chart API calls supported that return PNG images as result. The calls have the following endpoints:

* /charts/price.png -> Price history for the Conceal coin
* /charts/volume.png -> Volume history for the Conceal coin
* /charts/marketcap.png -> Marketcap history for the Conceal coin

The type chart you get back depends on the parameters you pass in the URL.

# Supported Parameters

**vsCurrency**: The currency versus which the chart values are ploted. For instance USD. Example:

```
charts/price.png?vsCurrency=usd
```

**days**: Timespan for which the chart is ploted. Example:

```
charts/price.png?days=30
```

**xPoints**: The number of labels on the x-axis. Example:

```
charts/price.png?xPoints=7
```

**priceDecimals**: The number of decimal places for the price values. Example:

```
charts/price.png?priceDecimals=2
```

**priceSymbol**: The symbol appended to the price values. Example:

```
charts/price.png?priceSymbol=$
```

**width**: the width of the resulting image. Example:

```
charts/price.png?width=1200
```

**height**: the height of the resulting image. Example:

```
charts/price.png?height=800
```
