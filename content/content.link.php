<?php

require_once(TOOLKIT . '/class.jsonpage.php');

Class contentExtensionAssociation_ui_selectorLink extends JSONPage
{

    public function view()
    {
        $entry_id = General::sanitize($_GET['entry_id']);
        $parent_section_id = EntryManager::fetchEntrySectionID($entry_id);
        $parent_section = SectionManager::fetch($parent_section_id);
        $parent_section_handle = $parent_section->get('handle');

        // Set data
        $this->_Result['entry']['section'] = $parent_section_handle;
        $this->_Result['entry']['link'] = APPLICATION_URL . '/publish/' . $parent_section_handle . '/edit/' . $entry_id . '/';

        // Return results
        return $this->_Result;
    }
}
