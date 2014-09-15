## Association UI for Symphony: Selector

![Interface preview](https://cloud.githubusercontent.com/assets/25466/3174581/3520a7de-ebf3-11e3-9907-a0e4b77fce0b.png)

Selector provides a search and select interface for associative Symphony fields. It works with core select boxes and tag lists as well as with [Association fields](https://github.com/symphonists/association_field).

### Installation

1. Upload Selector to your `extensions` folder.
2. Enable Selector in the backend.
3. Add an associative field to your section and choose one of the interface.

Please keep in mind that interface are only available in combination with dynamic values, if you are using default select boxes or tag lists.

#### Modes

There are two modes:

- single select
- multiple select

#### Sorting

Sorting is currently only available for [Association fields](https://github.com/symphonists/association_field).

#### Custom Captions

It’s possible to include markup in your related field in order to create more informative item captions. Selector bundles styles for text, image previews and emphasis. If you’d like to combine multiple field values into a single caption, please take a look at [Reflection field](https://github.com/symphonists/reflectionfield).

##### Basic Reflection field expressions

You can create a second row with a standard `<br />`. Emphasized text will be displayed in grey. The Reflection field can access fields by `entry/[fieldname]`. For example:

```xsl
{entry/title}<br/><em>{entry/upload/filename}</em>
```

If you want to display an image thumbnail you can make use of JIT. An image size of 35×35px works best. Using [this Reflection field fork](https://github.com/orchard-studio/reflectionfield/commit/55095a959edee25f6306718302404060dad58cb5) mentioned [here](http://www.getsymphony.com/discuss/thread/106489/4/#position-65), you can use `{root}` to create a dynamic URL:

```xml
<img src='{root}/image/2/35/35/5/{entry/upload/filename}' /> {entry/title}<br/><em>{entry/upload/filename}</em>
```

##### Reflection field with XSLT-utility

For more complex needs Reflection field lets you use an XSLT-utility. Here’s an example that formats biographic-data nicely based on if data is available in a specific entry. The Reflection field expression is simply:

```xml
{person}
```
    
The XSLT-utility needs to be in the `workspace/utilities` folder. It will be selectable in the Reflection field settings:

```xml
<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="data/entry">
    <data>
        <xsl:element name="person">
            <!-- Image thumbnail will only created if an image is present in the current entry -->
            <xsl:if test="image/filename">
                <!-- in order to make HTML-output work here wen need to warp the code elements in CDATA tags (thanks John :) -->
                <xsl:text><![CDATA[<img src=']]></xsl:text>
                <!-- I’m using a fork with a root-pseudo-parameter here. See https://github.com/animaux/reflectionfield/commit/2d10a65c5f9d0ed59f8c211863808471b90a3376 -->
                <xsl:value-of select="//params/root"/>
                <xsl:text>/image/2/35/35/5</xsl:text>
                <xsl:value-of select="image/@path"/>
                <xsl:text>/</xsl:text>
                <xsl:value-of select="image/filename"/>
                <xsl:text><![CDATA['/>]]></xsl:text>
            </xsl:if>
            <!-- Name expects first and last name to be mandatory -->
            <xsl:value-of select="firstname"/>
            <xsl:text> </xsl:text>
            <xsl:value-of select="lastname"/>
            <!-- Biographic data checks for existing data and adds an asterisk if only date of birth is present, and a cross if only date of death is present -->
            <xsl:if test="year_of_birth!= '' or year_of_death != ''">
                <xsl:text><![CDATA[<br/><em>]]></xsl:text>
                <xsl:choose>
                    <xsl:when test="year_of_birth != '' and year_of_death != ''">
                        <xsl:value-of select="year_of_birth/text()"/>–<xsl:value-of select="year_of_death/text()"/>
                    </xsl:when>
                    <xsl:when test="year_of_death = '' and year_of_birth != ''">
                        *<xsl:value-of select="year_of_birth/text()"/>
                    </xsl:when>
                    <xsl:when test="year_of_birth = '' and year_of_death != ''">
                        †<xsl:value-of select="year_of_death/text()"/>
                    </xsl:when>
                </xsl:choose>
                <xsl:text><![CDATA[</em>]]></xsl:text>
            </xsl:if>
        </xsl:element>
    </data>
</xsl:template>

</xsl:stylesheet>
```

### Acknowledgement

The interface of Selector is based on [Selectize by Brian Reavis](https://github.com/brianreavis/selectize.js) bundled with the Symphony core.

This project has kindly been funded by [Bernardo Dias da Cruz](http://bernardodiasdacruz.com/), Ben Babcock, Juraj Kapsz, Daniel Golbig, Vojtech Grec, [Andrea Buran](http://www.andreaburan.com/), [Brendan Abbot](http://bloodbone.ws/), [Roman Klein](http://romanklein.com), [Korelogic](http://korelogic.co.uk/), Ngai Kam Wing, [David Oliver](http://doliver.co.uk/), Patrick Probst, Mario Butera, John Puddephatt, [Goldwiege](http://www.goldwiege.de/), Andrew Minton, munki-boy, Martijn Kremers, Ian Young, Leo Nikkilä, [Jonathan Mifsud](http://jonmifsud.com/) and others. [Read more](http://www.getsymphony.com/discuss/thread/106489/). 

If you like this extension, please consider a donation to support the further development.

[![PayPal Donation](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YAVPERDXP89TC)
